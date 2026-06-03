// venue controller manages physical locations where workshops are held
// providers can have multiple venues (e.g., main studio, satellite locations, partner spaces)
// each provider can designate one default venue
// accessible by providers and admins only

using System.Security.Claims;
using API.Data;
using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Provider,Admin")] // only providers and admins can manage venues
[ApiController]
[Route("api/venues")]
public class VenueController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public VenueController(ApplicationDbContext context)
    {
        _context = context;
    }

    // returns all venues belonging to the current provider
    // ordered by isdefault flag first, then alphabetically by name
    // used in workshop creation form to select venue location
    // GET: api/venues
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VenueResponse>>> GetMyVenues()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
        if (provider == null) return NotFound("Provider profile not found");

        var venues = await _context.Venues
            .Where(v => v.ProviderId == provider.Id)
            .OrderByDescending(v => v.IsDefault) // default venue appears first
            .ThenBy(v => v.Name)
            .Select(v => new VenueResponse
            {
                Id = v.Id,
                Name = v.Name,
                Address = v.Address,
                Latitude = v.Latitude, // for map display
                Longitude = v.Longitude,
                Description = v.Description,
                IsDefault = v.IsDefault  // whether this is the primary venue
            })
            .ToListAsync();

        return Ok(venues);
    }

    // creates a new venue for the current provider
    // if isdefault is true, all other venues are demoted from default status
    // POST: api/venues
    [HttpPost]
    public async Task<ActionResult<VenueResponse>> CreateVenue([FromBody] VenueRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
        if (provider == null) return NotFound("Provider profile not found");

        // if marking this venue as default, clear default flag from all other venues
        if (request.IsDefault)
        {
            var defaults = await _context.Venues.Where(v => v.ProviderId == provider.Id && v.IsDefault).ToListAsync();
            foreach (var d in defaults) d.IsDefault = false;
        }

        var venue = new Venue
        {
            ProviderId = provider.Id,
            Name = request.Name,
            Address = request.Address,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Description = request.Description,
            IsDefault = request.IsDefault
        };

        _context.Venues.Add(venue);
        await _context.SaveChangesAsync();

        return Ok(new VenueResponse
        {
            Id = venue.Id,
            Name = venue.Name,
            Address = venue.Address,
            Latitude = venue.Latitude,
            Longitude = venue.Longitude,
            Description = venue.Description,
            IsDefault = venue.IsDefault
        });
    }

    // deletes a venue
    // only works if venue belongs to the current provider
    // note: venues with existing workshop schedules may have foreign key constraints
    // DELETE: api/venues/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVenue(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
        if (provider == null) return NotFound();

        var venue = await _context.Venues.FirstOrDefaultAsync(v => v.Id == id && v.ProviderId == provider.Id);
        if (venue == null) return NotFound();

        _context.Venues.Remove(venue);
        await _context.SaveChangesAsync();

        return NoContent(); // 204 (standard rest delete response)
    }
}

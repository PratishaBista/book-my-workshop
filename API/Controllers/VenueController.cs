using System.Security.Claims;
using API.Data;
using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Provider,Admin")]
[ApiController]
[Route("api/venues")]
public class VenueController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public VenueController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VenueResponse>>> GetMyVenues()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
        if (provider == null) return NotFound("Provider profile not found");

        var venues = await _context.Venues
            .Where(v => v.ProviderId == provider.Id)
            .OrderByDescending(v => v.IsDefault)
            .ThenBy(v => v.Name)
            .Select(v => new VenueResponse
            {
                Id = v.Id,
                Name = v.Name,
                Address = v.Address,
                Latitude = v.Latitude,
                Longitude = v.Longitude,
                Description = v.Description,
                IsDefault = v.IsDefault
            })
            .ToListAsync();

        return Ok(venues);
    }

    [HttpPost]
    public async Task<ActionResult<VenueResponse>> CreateVenue([FromBody] VenueRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
        if (provider == null) return NotFound("Provider profile not found");

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

        return NoContent();
    }
}

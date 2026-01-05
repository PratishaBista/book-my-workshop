using System;
using System.Threading.Tasks;

namespace API.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
}

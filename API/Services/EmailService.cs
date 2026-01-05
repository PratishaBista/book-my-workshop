using System.Net;
using System.Net.Mail;

namespace API.Services;

public class EmailService : IEmailService
{
    private readonly string _smtpServer = "smtp.gmail.com";
    private readonly int _port = 587;
    private readonly string _senderEmail;
    private readonly string _password;
    private readonly string _senderName;

    public EmailService(IConfiguration configuration)
    {
        _senderEmail = Environment.GetEnvironmentVariable("SMTP_EMAIL") 
                      ?? configuration["EmailSettings:SenderEmail"] 
                      ?? throw new InvalidOperationException("SMTP_EMAIL is not configured.");
        
        _password = Environment.GetEnvironmentVariable("SMTP_PASSWORD") 
                    ?? configuration["EmailSettings:Password"] 
                    ?? throw new InvalidOperationException("SMTP_PASSWORD is not configured.");

        _senderName = Environment.GetEnvironmentVariable("EMAIL_FROM_NAME") 
                      ?? configuration["EmailSettings:SenderName"] 
                      ?? "BookMyWorkshop Team";
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            using var message = new MailMessage();
            message.From = new MailAddress(_senderEmail, _senderName);
            message.To.Add(new MailAddress(to));
            message.Subject = subject;
            message.Body = body;
            message.IsBodyHtml = true;

            using var client = new SmtpClient(_smtpServer, _port)
            {
                Credentials = new NetworkCredential(_senderEmail, _password),
                EnableSsl = true
            };

            await client.SendMailAsync(message);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending email via SMTP to {to}: {ex.Message}");
            throw;
        }
    }
}

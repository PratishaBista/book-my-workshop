namespace API.Services;

public static class EmailTemplates
{
    public static string GetVerificationEmail(string verificationLink)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Verify Your Account</title>
</head>
<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, ""Helvetica Neue"", Arial, sans-serif; background-color: #f5f5f5;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td align='center' style='padding: 40px 20px;'>
                <table role='presentation' style='width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff;'>
                    
                    <!-- Header with Logo -->
                    <tr>
                        <td style='padding: 40px 40px 30px 40px; text-align: center; border-bottom: 1px solid #e5e7eb;'>
                            <img src='https://res.cloudinary.com/daaysxdli/image/upload/v1767434247/Badge_hjkzju.png' alt='BookMyWorkshop' style='height: 60px; margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto;' />
                            <p style='margin: 0; color: #6B7280; font-size: 13px; font-weight: 500; letter-spacing: 0.5px;'>
                                BOOKMYWORKSHOP
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style='padding: 50px 40px;'>
                            <h1 style='margin: 0 0 24px 0; color: #111827; font-size: 24px; font-weight: 600; line-height: 1.3;'>
                                Verify Your Account
                            </h1>
                            <p style='margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;'>
                                Thank you for joining BookMyWorkshop.
                            </p>
                            <p style='margin: 0 0 32px 0; color: #374151; font-size: 16px; line-height: 1.6;'>
                                To complete your registration, please verify your email address by clicking the link below:
                            </p>
                            
                            <!-- Clickable Link -->
                            <div style='text-align: center; margin: 32px 0;'>
                                <a href='{verificationLink}' style='color: #6B46C1; text-decoration: none; font-size: 16px; font-weight: 600; border-bottom: 2px solid #6B46C1; padding-bottom: 2px;'>Click here to verify your account</a>
                            </div>
                            
                            <p style='margin: 32px 0 12px 0; color: #6B7280; font-size: 14px; line-height: 1.6;'>
                                Or copy and paste this URL into your browser:
                            </p>
                            <div style='margin: 0 0 32px 0; padding: 14px; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px;'>
                                <p style='margin: 0; color: #6B46C1; font-size: 13px; word-break: break-all; font-family: monospace;'>
                                    {verificationLink}
                                </p>
                            </div>
                            
                            <div style='padding-top: 32px; border-top: 1px solid #E5E7EB;'>
                                <p style='margin: 0 0 8px 0; color: #6B7280; font-size: 13px; line-height: 1.5;'>
                                    This verification link will expire in 24 hours.
                                </p>
                                <p style='margin: 0; color: #6B7280; font-size: 13px; line-height: 1.5;'>
                                    If you did not create this account, you can safely ignore this email.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='background-color: #F9FAFB; padding: 32px 40px; border-top: 1px solid #E5E7EB;'>
                            <p style='margin: 0 0 8px 0; color: #6B7280; font-size: 13px; text-align: center;'>
                                Questions? Contact our support team at
                            </p>
                            <p style='margin: 0 0 16px 0; text-align: center;'>
                                <a href='mailto:support@bookmyworkshop.com' style='color: #6B46C1; text-decoration: none; font-size: 13px; font-weight: 500;'>support@bookmyworkshop.com</a>
                            </p>
                            <p style='margin: 0; color: #9CA3AF; font-size: 12px; text-align: center; line-height: 1.5;'>
                                © 2026 BookMyWorkshop. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    public static string GetPasswordResetEmail(string resetLink)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Reset Your Password</title>
</head>
<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, ""Helvetica Neue"", Arial, sans-serif; background-color: #f5f5f5;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td align='center' style='padding: 40px 20px;'>
                <table role='presentation' style='width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff;'>
                    
                    <!-- Header with Logo -->
                    <tr>
                        <td style='padding: 40px 40px 30px 40px; text-align: center; border-bottom: 1px solid #e5e7eb;'>
                            <img src='https://res.cloudinary.com/daaysxdli/image/upload/v1767434247/Badge_hjkzju.png' alt='BookMyWorkshop' style='height: 60px; margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto;' />
                            <p style='margin: 0; color: #6B7280; font-size: 13px; font-weight: 500; letter-spacing: 0.5px;'>
                                BOOKMYWORKSHOP
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style='padding: 50px 40px;'>
                            <h1 style='margin: 0 0 24px 0; color: #111827; font-size: 24px; font-weight: 600; line-height: 1.3;'>
                                Reset Your Password
                            </h1>
                            <p style='margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;'>
                                We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
                            </p>
                            <p style='margin: 0 0 32px 0; color: #374151; font-size: 16px; line-height: 1.6;'>
                                To reset your password, please click the link below:
                            </p>
                            
                            <!-- Clickable Link -->
                            <div style='text-align: center; margin: 32px 0;'>
                                <a href='{resetLink}' style='color: #6B46C1; text-decoration: none; font-size: 16px; font-weight: 600; border-bottom: 2px solid #6B46C1; padding-bottom: 2px;'>Click here to reset your password</a>
                            </div>
                            
                            <p style='margin: 32px 0 12px 0; color: #6B7280; font-size: 14px; line-height: 1.6;'>
                                Or copy and paste this URL into your browser:
                            </p>
                            <div style='margin: 0 0 32px 0; padding: 14px; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px;'>
                                <p style='margin: 0; color: #6B46C1; font-size: 13px; word-break: break-all; font-family: monospace;'>
                                    {resetLink}
                                </p>
                            </div>
                            
                            <div style='padding-top: 32px; border-top: 1px solid #E5E7EB;'>
                                <p style='margin: 0 0 8px 0; color: #6B7280; font-size: 13px; line-height: 1.5;'>
                                    This link will expire in 2 hours for security reasons.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='background-color: #F9FAFB; padding: 32px 40px; border-top: 1px solid #E5E7EB;'>
                            <p style='margin: 0 0 8px 0; color: #6B7280; font-size: 13px; text-align: center;'>
                                Need help? Contact us at
                            </p>
                            <p style='margin: 0 0 16px 0; text-align: center;'>
                                <a href='mailto:support@bookmyworkshop.com' style='color: #6B46C1; text-decoration: none; font-size: 13px; font-weight: 500;'>support@bookmyworkshop.com</a>
                            </p>
                            <p style='margin: 0; color: #9CA3AF; font-size: 12px; text-align: center; line-height: 1.5;'>
                                © 2026 BookMyWorkshop. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    public static string GetHostApprovalEmail(string hostName, string dashboardLink)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Account Approved</title>
</head>
<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, ""Helvetica Neue"", Arial, sans-serif; background-color: #f5f5f5;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td align='center' style='padding: 40px 20px;'>
                <table role='presentation' style='width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff;'>
                    
                    <!-- Header with Logo -->
                    <tr>
                        <td style='padding: 40px 40px 30px 40px; text-align: center; border-bottom: 1px solid #e5e7eb;'>
                            <img src='https://res.cloudinary.com/daaysxdli/image/upload/v1767434247/Badge_hjkzju.png' alt='BookMyWorkshop' style='height: 60px; margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto;' />
                            <p style='margin: 0; color: #6B7280; font-size: 13px; font-weight: 500; letter-spacing: 0.5px;'>
                                BOOKMYWORKSHOP
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style='padding: 50px 40px;'>
                            <h1 style='margin: 0 0 24px 0; color: #111827; font-size: 24px; font-weight: 600; line-height: 1.3;'>
                                Welcome to our artisan community
                            </h1>
                            <p style='margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;'>
                                Dear {hostName},
                            </p>
                            <p style='margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;'>
                                We are pleased to inform you that your host profile has been successfully reviewed and approved by our team. Your account is now fully active, and you are cleared to begin listing your workshops on the platform.
                            </p>
                            <p style='margin: 0 0 32px 0; color: #374151; font-size: 16px; line-height: 1.6;'>
                                We are truly excited to have you join our mission of fostering creativity and hands-on learning. To get started, you can access your host dashboard using the link below:
                            </p>
                            
                            <!-- Action Link -->
                            <div style='text-align: center; margin: 32px 0;'>
                                <a href='{dashboardLink}' style='background-color: #6B46C1; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 6px; display: inline-block;'>Go to Host Dashboard</a>
                            </div>
                            
                            <p style='margin: 32px 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;'>
                                If you have any questions as you set up your first workshop, please do not hesitate to reach out to our partner success team.
                            </p>
                            
                            <p style='margin: 40px 0 0 0; color: #111827; font-size: 16px; font-weight: 600;'>
                                Best regards,
                            </p>
                            <p style='margin: 4px 0 0 0; color: #6B7280; font-size: 16px;'>
                                The BookMyWorkshop Team
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='background-color: #F9FAFB; padding: 32px 40px; border-top: 1px solid #E5E7EB;'>
                            <p style='margin: 0 0 16px 0; color: #9CA3AF; font-size: 12px; text-align: center; line-height: 1.5;'>
                                You received this email because your account was approved on BookMyWorkshop.
                            </p>
                            <p style='margin: 0; color: #9CA3AF; font-size: 12px; text-align: center; line-height: 1.5;'>
                                © 2026 BookMyWorkshop. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    public static string GetSuperAdminMfaEmail(string code)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>SuperAdmin Verification Code</title>
</head>
<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, ""Helvetica Neue"", Arial, sans-serif; background-color: #f5f5f5;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td align='center' style='padding: 40px 20px;'>
                <table role='presentation' style='width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-top: 4px solid #6B46C1;'>
                    
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px 40px; text-align: center;'>
                            <img src='https://res.cloudinary.com/daaysxdli/image/upload/v1767434247/Badge_hjkzju.png' alt='BookMyWorkshop' style='height: 50px; margin-bottom: 20px;' />
                            <p style='margin: 0; color: #6B7280; font-size: 12px; font-weight: 700; letter-spacing: 2px; uppercase;'>
                                SECURITY ALERT
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style='padding: 20px 40px 40px 40px;'>
                            <h1 style='margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 700; text-align: center;'>
                                Your Verification Code
                            </h1>
                            <p style='margin: 0 0 32px 0; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;'>
                                A login attempt was detected for the SuperAdmin account. Please use the following code to complete your sign-in:
                            </p>
                            
                            <!-- Verification Code -->
                            <div style='text-align: center; margin: 32px 0;'>
                                <div style='background-color: #F3F0FF; color: #6B46C1; font-size: 36px; font-weight: 800; letter-spacing: 12px; padding: 24px; border-radius: 12px; display: inline-block; border: 2px dashed #6B46C1;'>
                                    {code}
                                </div>
                            </div>
                            
                            <p style='margin: 32px 0 0 0; color: #6B7280; font-size: 14px; line-height: 1.5; text-align: center;'>
                                This code is valid for <strong>10 minutes</strong>. 
                            </p>
                            <p style='margin: 8px 0 0 0; color: #EF4444; font-size: 13px; font-weight: 500; text-align: center;'>
                                If you did not attempt this login, please contact technical security immediately.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='background-color: #F9FAFB; padding: 32px 40px; border-top: 1px solid #E5E7EB;'>
                            <p style='margin: 0; color: #9CA3AF; font-size: 12px; text-align: center;'>
                                © 2026 BookMyWorkshop Architecture. System Identity Module.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    public static string GetDeletionWarningEmail(string userName, string loginLink)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Final Notice: Account Deletion</title>
</head>
<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, ""Helvetica Neue"", Arial, sans-serif; background-color: #f5f5f5;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td align='center' style='padding: 40px 20px;'>
                <table role='presentation' style='width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-top: 4px solid #EF4444;'>
                    
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px 40px; text-align: center;'>
                            <img src='https://res.cloudinary.com/daaysxdli/image/upload/v1767434247/Badge_hjkzju.png' alt='BookMyWorkshop' style='height: 50px; margin-bottom: 20px;' />
                            <p style='margin: 0; color: #EF4444; font-size: 12px; font-weight: 700; letter-spacing: 2px;'>
                                FINAL NOTICE
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style='padding: 20px 40px 40px 40px;'>
                            <h1 style='margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 700;'>
                                Your account will be deleted in 24 hours
                            </h1>
                            <p style='margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;'>
                                Hi {userName},
                            </p>
                            <p style='margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;'>
                                30 days ago, you requested to delete your BookMyWorkshop account. This process is now almost complete.
                            </p>
                            <p style='margin: 0 0 32px 0; color: #374151; font-size: 16px; line-height: 1.6; padding: 16px; background-color: #FEF2F2; border-radius: 8px; border-left: 4px solid #EF4444;'>
                                <strong>In less than 24 hours</strong>, your profile, workshops, and all personal data will be permanently purged from our systems. <strong>This action cannot be undone.</strong>
                            </p>
                            
                            <p style='margin: 0 0 32px 0; color: #374151; font-size: 16px; line-height: 1.6;'>
                                If you've changed your mind, there's still time! Simply log back into your account before the timer runs out to cancel the deletion request and keep your data.
                            </p>
                            
                            <!-- Action Link -->
                            <div style='text-align: center; margin: 32px 0;'>
                                <a href='{loginLink}' style='background-color: #6B46C1; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 6px; display: inline-block;'>Log In to Cancel Deletion</a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='background-color: #F9FAFB; padding: 32px 40px; border-top: 1px solid #E5E7EB;'>
                            <p style='margin: 0; color: #9CA3AF; font-size: 12px; text-align: center;'>
                                If you intended to delete your account, you can disregard this email.
                            </p>
                            <p style='margin: 12px 0 0 0; color: #9CA3AF; font-size: 12px; text-align: center;'>
                                © 2026 BookMyWorkshop. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    public static string GetNewsletterWelcomeEmail()
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Welcome to BookMyWorkshop</title>
</head>
<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, ""Helvetica Neue"", Arial, sans-serif; background-color: #FAF8F2;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td align='center' style='padding: 40px 20px;'>
                <table role='presentation' style='width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);'>
                    
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 30px 40px; text-align: center; background-color: #ffffff;'>
                            <img src='https://res.cloudinary.com/daaysxdli/image/upload/v1767434247/Badge_hjkzju.png' alt='BookMyWorkshop' style='height: 60px; margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto;' />
                            <p style='margin: 0; color: #EE7932; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;'>
                                Community & Craft
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style='padding: 20px 40px 40px 40px;'>
                            <h1 style='margin: 0 0 24px 0; color: #1A0B2E; font-size: 28px; font-weight: 700; text-align: center; font-family: serif; line-height: 1.2;'>
                                You're on the list.
                            </h1>
                            <p style='margin: 0 0 20px 0; color: #4A4A4A; font-size: 16px; line-height: 1.7; text-align: center;'>
                                Thank you for joining our creative community. From now on, you'll be the first to know about new workshops, artisan stories, and exclusive community events across Nepal.
                            </p>
                            
                            <!-- Main Call to Action -->
                            <div style='text-align: center; margin: 40px 0;'>
                                <a href='http://localhost:4000/workshops' style='background-color: #EE7932; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 40px; border-radius: 50px; display: inline-block; box-shadow: 0 10px 20px rgba(238, 121, 50, 0.2);'>Explore Live Workshops</a>
                            </div>

                            <hr style='border: 0; border-top: 1px solid #F0F0F0; margin: 40px 0;' />

                            <h3 style='margin: 0 0 20px 0; color: #1A0B2E; font-size: 18px; font-weight: 600; text-align: center;'>Other ways to engage</h3>
                            
                            <table role='presentation' style='width: 100%; border-collapse: collapse;'>
                                <tr>
                                    <td style='width: 50%; padding: 10px;'>
                                        <div style='background-color: #F9F9F5; padding: 20px; border-radius: 12px; text-align: center;'>
                                            <p style='margin: 0 0 10px 0; font-size: 14px; color: #4A4A4A; font-weight: 500;'>Gift an Experience</p>
                                            <a href='http://localhost:4000/' style='color: #EE7932; text-decoration: none; font-size: 14px; font-weight: 700; border-bottom: 2px solid #EE7932;'>Gift Cards</a>
                                        </div>
                                    </td>
                                    <td style='width: 50%; padding: 10px;'>
                                        <div style='background-color: #F9F9F5; padding: 20px; border-radius: 12px; text-align: center;'>
                                            <p style='margin: 0 0 10px 0; font-size: 14px; color: #4A4A4A; font-weight: 500;'>Teach Your Craft</p>
                                            <a href='http://localhost:4000/host-workshop' style='color: #EE7932; text-decoration: none; font-size: 14px; font-weight: 700; border-bottom: 2px solid #EE7932;'>Become a Host</a>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='background-color: #1A0B2E; padding: 40px; color: #ffffff;'>
                            <p style='margin: 0 0 16px 0; font-size: 13px; text-align: center; color: #ffffff/60; line-height: 1.5;'>
                                You received this because you subscribed to the BookMyWorkshop newsletter.
                            </p>
                            <p style='margin: 0; font-size: 12px; text-align: center; color: #ffffff/40;'>
                                © 2026 BookMyWorkshop. All rights reserved. <br /> Kathmandu, Nepal.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    public static string GetContactNotificationEmail(string name, string email, string message)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>New Contact Message</title>
</head>
<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, ""Helvetica Neue"", Arial, sans-serif; background-color: #f5f5f5;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td align='center' style='padding: 40px 20px;'>
                <table role='presentation' style='width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff;'>
                    
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px; text-align: center; border-bottom: 1px solid #e5e7eb;'>
                            <img src='https://res.cloudinary.com/daaysxdli/image/upload/v1767434247/Badge_hjkzju.png' alt='BookMyWorkshop' style='height: 50px; margin-bottom: 16px;' />
                            <h2 style='margin: 0; color: #111827; font-size: 20px; font-weight: 600;'>New Message from Contact Form</h2>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style='padding: 40px;'>
                            <div style='margin-bottom: 24px;'>
                                <p style='margin: 0 0 8px 0; color: #6B7280; font-size: 14px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;'>From</p>
                                <p style='margin: 0; color: #111827; font-size: 16px;'>{name} ({email})</p>
                            </div>
                            
                            <div style='margin-bottom: 24px;'>
                                <p style='margin: 0 0 8px 0; color: #6B7280; font-size: 14px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;'>Message</p>
                                <div style='margin: 0; padding: 16px; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; color: #374151; font-size: 16px; line-height: 1.6; white-space: pre-wrap;'>
                                    {message}
                                </div>
                            </div>
                            
                            <div style='text-align: center; margin-top: 32px;'>
                                <a href='mailto:{email}' style='background-color: #6B46C1; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 6px; display: inline-block;'>Reply to {name}</a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='background-color: #F9FAFB; padding: 32px; border-top: 1px solid #E5E7EB; text-align: center;'>
                            <p style='margin: 0; color: #9CA3AF; font-size: 12px;'>
                                This message was sent via the contact form on BookMyWorkshop.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    public static string GetBookingConfirmationEmail(
        string guestName,
        string workshopTitle,
        string sessionDate,
        string sessionTime,
        string venue,
        string? locationName,
        int seatCount,
        string confirmationCode,
        string ticketUrl,
        string qrCodeBase64)
    {
        var venueLine = string.IsNullOrWhiteSpace(locationName)
            ? venue
            : $"{locationName}<br/><span style='color:#6B7280;font-size:14px;'>{venue}</span>";
        var seatLabel = seatCount == 1 ? "1 seat" : $"{seatCount} seats";

        return $@"
<!DOCTYPE html>
<html>
<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>
<body style='margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,""Segoe UI"",Roboto,sans-serif;background-color:#f5f5f5;'>
<table role='presentation' style='width:100%;border-collapse:collapse;'>
<tr><td align='center' style='padding:40px 20px;'>
<table role='presentation' style='width:600px;max-width:100%;background:#ffffff;border-collapse:collapse;'>
<tr><td style='padding:40px;text-align:center;border-bottom:1px solid #e5e7eb;'>
<img src='https://res.cloudinary.com/daaysxdli/image/upload/v1767434247/Badge_hjkzju.png' alt='BookMyWorkshop' style='height:56px;margin-bottom:12px;' />
<p style='margin:0;color:#6B7280;font-size:12px;font-weight:600;letter-spacing:0.15em;'>BOOKMYWORKSHOP</p>
</td></tr>
<tr><td style='padding:48px 40px;'>
<p style='margin:0 0 8px 0;color:#6B46C1;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;'>You're all set</p>
<h1 style='margin:0 0 16px 0;color:#111827;font-size:26px;font-weight:600;line-height:1.3;'>Hi {guestName}, your spot is reserved!</h1>
<p style='margin:0 0 28px 0;color:#374151;font-size:16px;line-height:1.7;'>
We're so excited you'll be joining us for <strong>{workshopTitle}</strong>. Show the QR code below at the venue — we'll take care of the rest.
</p>
<div style='background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:24px;margin-bottom:28px;'>
<p style='margin:0 0 12px 0;font-size:11px;font-weight:700;color:#9CA3AF;letter-spacing:0.1em;text-transform:uppercase;'>Session details</p>
<p style='margin:0 0 8px 0;color:#111827;font-size:16px;font-weight:600;'>{sessionDate}</p>
<p style='margin:0 0 16px 0;color:#374151;font-size:15px;'>{sessionTime}</p>
<p style='margin:0 0 16px 0;color:#374151;font-size:15px;line-height:1.5;'>{venueLine}</p>
<p style='margin:0;color:#374151;font-size:15px;'><strong>Guests:</strong> {seatLabel} &nbsp;·&nbsp; <strong>Ticket:</strong> <span style='font-family:monospace;color:#6B46C1;'>{confirmationCode}</span></p>
</div>
<div style='text-align:center;margin:32px 0;'>
<img src='data:image/png;base64,{qrCodeBase64}' alt='Check-in QR code' width='200' height='200' style='display:block;margin:0 auto 16px;border:8px solid #fff;box-shadow:0 4px 24px rgba(0,0,0,0.08);border-radius:12px;' />
<p style='margin:0 0 20px 0;color:#6B7280;font-size:13px;'>Scan at the venue for check-in</p>
<a href='{ticketUrl}' style='background-color:#6B46C1;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;display:inline-block;'>View your ticket</a>
</div>
<p style='margin:32px 0 0 0;color:#6B7280;font-size:13px;line-height:1.6;border-top:1px solid #E5E7EB;padding-top:24px;'>
Can't find this email? Your ticket is also saved under <strong>Profile → Your Experiences</strong>. After the session, you'll be able to share a review once your host confirms your attendance.
</p>
</td></tr>
<tr><td style='background:#F9FAFB;padding:28px 40px;border-top:1px solid #E5E7EB;text-align:center;'>
<p style='margin:0;color:#9CA3AF;font-size:12px;'>© 2026 BookMyWorkshop · Made with care in Nepal</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>";
    }

    public static string GetGiftCardEmail(string senderName, string recipientEmail, decimal amount, string code, string claimLink, string? personalMessage)
    {
        var messageSection = string.IsNullOrWhiteSpace(personalMessage) 
            ? "" 
            : $@"<div style='margin-bottom: 24px; padding: 16px; background-color: #F9FAFB; border-left: 4px solid #EE7932; border-radius: 4px; color: #4A4A4A; font-style: italic; font-size: 15px;'>
                    ""{personalMessage}""
                 </div>";

        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>You've Received a Gift Card!</title>
</head>
<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, ""Helvetica Neue"", Arial, sans-serif; background-color: #FAF8F2;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td align='center' style='padding: 40px 20px;'>
                <table role='presentation' style='width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);'>
                    
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 30px 40px; text-align: center; background-color: #ffffff;'>
                            <img src='https://res.cloudinary.com/daaysxdli/image/upload/v1767434247/Badge_hjkzju.png' alt='BookMyWorkshop' style='height: 60px; margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto;' />
                            <p style='margin: 0; color: #EE7932; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;'>
                                Gift Card Experience
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style='padding: 20px 40px 40px 40px;'>
                            <h1 style='margin: 0 0 24px 0; color: #1A0B2E; font-size: 28px; font-weight: 700; text-align: center; font-family: serif; line-height: 1.2;'>
                                You've received a gift card!
                            </h1>
                            <p style='margin: 0 0 20px 0; color: #4A4A4A; font-size: 16px; line-height: 1.7; text-align: center;'>
                                Great news! <strong>{senderName}</strong> has sent you a BookMyWorkshop gift card.
                            </p>
                            
                            {messageSection}

                            <!-- Card design -->
                            <div style='background: linear-gradient(135deg, #1A0B2E 0%, #3B1560 100%); color: #ffffff; border-radius: 16px; padding: 32px; text-align: center; margin: 32px 0; box-shadow: 0 10px 25px rgba(26, 11, 46, 0.15); position: relative;'>
                                <div style='font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #EE7932; margin-bottom: 8px;'>BookMyWorkshop Gift Card</div>
                                <div style='font-size: 40px; font-weight: 800; font-family: serif; margin-bottom: 16px;'>Rs. {amount:N0}</div>
                                <div style='font-size: 14px; font-family: monospace; letter-spacing: 1px; background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 8px; display: inline-block;'>CODE: {code}</div>
                            </div>

                            <!-- Main Call to Action -->
                            <div style='text-align: center; margin: 40px 0;'>
                                <a href='{claimLink}' style='background-color: #EE7932; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 40px; border-radius: 50px; display: inline-block; box-shadow: 0 10px 20px rgba(238, 121, 50, 0.2);'>Claim Your Gift Card</a>
                            </div>

                            <p style='margin: 0; color: #6B7280; font-size: 14px; line-height: 1.6; text-align: center;'>
                                Once claimed, the balance of Rs. {amount:N0} will be added to your BookMyWorkshop wallet. You can then use it to book any workshop on the platform!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='background-color: #1A0B2E; padding: 40px; color: #ffffff;'>
                            <p style='margin: 0; font-size: 12px; text-align: center; color: rgba(255,255,255,0.6);'>
                                © 2026 BookMyWorkshop. All rights reserved. <br /> Kathmandu, Nepal.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }
    public static string GetNotificationEmail(string title, string htmlMessage)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{title}</title>
</head>
<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, ""Helvetica Neue"", Arial, sans-serif; background-color: #f5f5f5;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td align='center' style='padding: 40px 20px;'>
                <table role='presentation' style='width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff;'>
                    
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px; text-align: center; border-bottom: 1px solid #e5e7eb;'>
                            <img src='https://res.cloudinary.com/daaysxdli/image/upload/v1767434247/Badge_hjkzju.png' alt='BookMyWorkshop' style='height: 50px; margin-bottom: 16px;' />
                            <h2 style='margin: 0; color: #111827; font-size: 20px; font-weight: 600;'>{title}</h2>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style='padding: 40px;'>
                            <div style='margin-bottom: 24px; color: #374151; font-size: 16px; line-height: 1.6;'>
                                {htmlMessage}
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='background-color: #F9FAFB; padding: 32px; border-top: 1px solid #E5E7EB; text-align: center;'>
                            <p style='margin: 0; color: #9CA3AF; font-size: 12px;'>
                                © 2026 BookMyWorkshop. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }
}

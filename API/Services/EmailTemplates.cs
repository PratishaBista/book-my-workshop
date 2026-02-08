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
}

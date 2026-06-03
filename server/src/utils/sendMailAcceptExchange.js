const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const SendMailAcceptExchange = async (email, orderCode) => {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        const info = await transport.sendMail({
            from: `"Moho" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Xác nhận yêu cầu đổi hàng của bạn',
            text: `Yêu cầu đổi hàng cho đơn ${orderCode} của bạn đã được chấp nhận. Vui lòng gửi hàng về địa chỉ: Đền Lừ, Hoàng Mai, Hà Nội.`,
            html: `
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: 'Roboto', sans-serif;
                        background-color: #f2f4f8;
                        margin: 0;
                        padding: 0;
                        color: #2d3436;
                    }
                    .container {
                        max-width: 600px;
                        margin: 30px auto;
                        background-color: #ffffff;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 6px 12px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #00b894, #55efc4);
                        padding: 30px;
                        color: #ffffff;
                        text-align: center;
                    }
                    .header h2 {
                        margin: 0;
                        font-size: 22px;
                    }
                    .content {
                        padding: 30px;
                    }
                    .message {
                        font-size: 16px;
                        margin-bottom: 20px;
                        line-height: 1.6;
                    }
                    .address-box {
                        text-align: center;
                        background-color: #f1f2f6;
                        border: 1px dashed #00b894;
                        padding: 20px;
                        font-size: 18px;
                        font-weight: bold;
                        color: #00b894;
                        border-radius: 10px;
                        letter-spacing: 1px;
                    }
                    .footer {
                        text-align: center;
                        font-size: 14px;
                        padding: 20px;
                        background-color: #f1f2f6;
                        color: #636e72;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Xác nhận chấp nhận đổi hàng</h2>
                    </div>
                    <div class="content">
                        <div class="message">
                            Xin chào quý khách,
                        </div>
                        <div class="message">
                            Chúng tôi xin thông báo rằng yêu cầu đổi hàng cho đơn hàng <strong>${orderCode}</strong> của bạn đã được <strong>chấp nhận</strong>.
                        </div>
                        <div class="message">
                            Vui lòng gửi sản phẩm cần đổi về địa chỉ dưới đây:
                        </div>
                        <div class="address-box">
                            Đền Lừ, Hoàng Mai, Hà Nội
                        </div>
                        <div class="message">
                            Sau khi nhận được hàng, chúng tôi sẽ tiến hành kiểm tra và gửi sản phẩm thay thế trong thời gian sớm nhất.
                        </div>
                    </div>
                    <div class="footer">
                        Trân trọng,<br/>
                        <strong>Đội ngũ Moho</strong>
                    </div>
                </div>
            </body>
            </html>
            `,
        });

        console.log('Exchange confirmation email sent:', info.messageId);
    } catch (error) {
        console.log('Error sending exchange confirmation email:', error);
    }
};

module.exports = SendMailAcceptExchange;

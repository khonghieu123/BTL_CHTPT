package com.ptit.ecommerce.notificationservice.consumer;

import com.ptit.ecommerce.notificationservice.config.RabbitMQConfig;
import com.ptit.ecommerce.notificationservice.dto.OrderCreatedEvent;
import com.ptit.ecommerce.notificationservice.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderNotificationConsumer {

    private final RestTemplate restTemplate;
    private final JavaMailSender mailSender;

    @Value("${user.service.url:http://localhost:8081}")
    private String userServiceUrl;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void consumeOrderCreatedNotification(OrderCreatedEvent event) {
        log.info("[Notification Service] Nhận được sự kiện tạo đơn hàng từ RabbitMQ: {}", event);

        if (event == null || event.getOrderId() == null || event.getUserId() == null) {
            log.warn("[Notification Service] Định dạng sự kiện đơn hàng không hợp lệ. Hủy gửi thông báo.");
            return;
        }

        String email = "unknown@customer.com";
        String username = "Khách hàng thân thiết";

        // Call user-service synchronously to fetch customer email and details
        try {
            String url = userServiceUrl + "/api/v1/auth/users/" + event.getUserId();
            log.info("[Notification Service] Đang truy vấn chi tiết khách hàng từ user-service cho ID: {} qua REST: {}", event.getUserId(), url);
            UserResponse user = restTemplate.getForObject(url, UserResponse.class);
            if (user != null) {
                email = user.getEmail();
                username = user.getUsername();
                log.info("[Notification Service] Đã lấy thành công thông tin khách hàng. Tài khoản: {}, Email: {}", username, email);
            }
        } catch (Exception e) {
            log.error("[Notification Service] Lỗi truy vấn thông tin khách hàng cho user ID: {}. Chi tiết: {}", event.getUserId(), e.getMessage());
            log.info("[Notification Service] Sử dụng thông tin khách hàng mặc định (Khách vãng lai).");
        }

        // Print email confirmation out to console first
        sendConsoleMockEmail(username, email, event.getOrderId(), event.getStatus());

        // Send real HTML email
        sendRealHtmlEmail(username, email, event.getOrderId(), event.getStatus());
    }

    private void sendConsoleMockEmail(String username, String email, Long orderId, String status) {
        log.info("=========================================================================");
        log.info("📧 HỆ THỐNG GỬI EMAIL GIẢ LẬP - ĐANG TRUYỀN TẢI THÔNG BÁO");
        log.info("-------------------------------------------------------------------------");
        log.info("Người nhận:  {} <{}>", username, email);
        if ("SUCCESS".equalsIgnoreCase(status)) {
            log.info("Tiêu đề:     🎉 Phê duyệt đơn hàng - Đơn hàng #{}", orderId);
            log.info("Nội dung:");
            log.info("    Xin chào {},", username);
            log.info("    ");
            log.info("    Chúng tôi vui mừng thông báo rằng đơn hàng số #{} của bạn", orderId);
            log.info("    đã được phê duyệt thành công bởi quản trị viên!");
            log.info("    Trạng thái hiện tại: [ {} ]", status);
            log.info("    ");
            log.info("    Hàng hóa của bạn đang được đóng gói và bàn giao cho đối tác vận chuyển.");
        } else {
            log.info("Tiêu đề:     🛒 Xác nhận đơn hàng - Đơn hàng #{}", orderId);
            log.info("Nội dung:");
            log.info("    Xin chào {},", username);
            log.info("    ");
            log.info("    Cảm ơn bạn đã mua sắm! Chúng tôi rất vui mừng xác nhận rằng đơn hàng");
            log.info("    số #{} của bạn đã được tạo thành công và ghi nhận trên hệ thống.", orderId);
            log.info("    Trạng thái hiện tại: [ {} ]", status);
            log.info("    ");
            log.info("    Bộ phận kho của chúng tôi đã nhận được thông tin đơn hàng và đang tiến hành");
            log.info("    chuẩn bị hàng hóa.");
        }
        log.info("    ");
        log.info("    Trân trọng,");
        log.info("    Đội ngũ PTIT E-Commerce");
        log.info("=========================================================================");
    }

    private void sendRealHtmlEmail(String username, String toEmail, Long orderId, String status) {
        if (senderEmail == null || senderEmail.trim().isEmpty() || senderEmail.contains("SMTP_USERNAME")) {
            log.info("[Notification Service] Chưa cấu hình SMTP_USERNAME thực tế. Bỏ qua luồng gửi email thật.");
            return;
        }

        log.info("[Notification Service] Đang bắt đầu gửi EMAIL THẬT tới: {}", toEmail);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, "PTIT E-Commerce");
            helper.setTo(toEmail);

            String statusBadge = "🟢 Đã Nhận Đơn Hàng";
            String emailSubject = "🛒 Xác Nhận Đơn Hàng Thành Công - Đơn Hàng #" + orderId;
            String messageDetail = "Cảm ơn bạn đã tin tưởng mua sắm tại cửa hàng của chúng tôi! Chúng tôi rất vui mừng xác nhận đơn hàng <strong>#" + orderId + "</strong> của bạn đã được khởi tạo thành công trên hệ thống phân tán.";
            String descriptionDetail = "Bộ phận kho của chúng tôi đã nhận được thông tin và đang lập tức tiến hành chuẩn bị đóng gói hàng hóa. Hệ thống sẽ tiếp tục cập nhật email cho bạn ngay khi đơn hàng được bàn giao cho đơn vị vận chuyển.";

            if ("SUCCESS".equalsIgnoreCase(status)) {
                statusBadge = "✨ Đã Phê Duyệt";
                emailSubject = "🎉 Đơn Hàng #" + orderId + " Đã Được Phê Duyệt!";
                messageDetail = "Chúng tôi vui mừng thông báo rằng đơn hàng <strong>#" + orderId + "</strong> của bạn đã được quản trị viên phê duyệt thành công! Chúng tôi đang chuẩn bị bàn giao cho đơn vị vận chuyển.";
                descriptionDetail = "Đơn hàng của bạn đã hoàn tất kiểm tra và phê duyệt. Hệ thống đang tạo mã vận đơn để tiến hành giao hàng sớm nhất có thể. Cảm ơn bạn rất nhiều vì đã đồng hành cùng PTIT E-Commerce!";
            } else if ("FAILED".equalsIgnoreCase(status) || "CANCELLED".equalsIgnoreCase(status)) {
                statusBadge = "❌ Đã Hủy Đơn";
                emailSubject = "❌ Thông Báo Hủy Đơn Hàng #" + orderId;
                messageDetail = "Chúng tôi rất tiếc phải thông báo rằng đơn hàng <strong>#" + orderId + "</strong> của bạn đã bị hủy trên hệ thống.";
                descriptionDetail = "Đơn hàng của bạn đã được cập nhật trạng thái hủy. Nếu bạn đã thực hiện thanh toán trước, tiền sẽ được hoàn trả lại tài khoản của bạn theo chính sách bảo hành giao dịch.";
            }

            helper.setSubject(emailSubject);

            // Xây dựng giao diện HTML chuyên nghiệp lung linh
            String htmlContent = "<div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);\">"
                    + "  <div style=\"background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 20px; text-align: center; color: white;\">"
                    + "    <h1 style=\"margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;\">PTIT E-COMMERCE</h1>"
                    + "    <p style=\"margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;\">Hệ thống phân tán hướng sự kiện chuyên nghiệp</p>"
                    + "  </div>"
                    + "  <div style=\"padding: 30px 25px; background-color: #ffffff;\">"
                    + "    <div style=\"text-align: center; margin-bottom: 25px;\">"
                    + "      <span style=\"background-color: #f0fdf4; color: #15803d; padding: 8px 16px; border-radius: 9999px; font-size: 13px; font-weight: 600; display: inline-block; border: 1px solid #bbf7d0;\">" + statusBadge + "</span>"
                    + "    </div>"
                    + "    <h2 style=\"color: #1e293b; font-size: 18px; margin-top: 0; font-weight: 600;\">Xin chào " + username + ",</h2>"
                    + "    <p style=\"color: #475569; line-height: 1.6; font-size: 15px;\">" + messageDetail + "</p>"
                    + "    <div style=\"background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; padding: 20px; margin: 25px 0;\">"
                    + "      <table style=\"width: 100%; border-collapse: collapse;\">"
                    + "        <tr>"
                    + "          <td style=\"color: #64748b; font-size: 14px; padding-bottom: 8px;\">Mã Đơn Hàng:</td>"
                    + "          <td style=\"color: #0f172a; font-size: 14px; font-weight: 600; text-align: right; padding-bottom: 8px;\">#" + orderId + "</td>"
                    + "        </tr>"
                    + "        <tr>"
                    + "          <td style=\"color: #64748b; font-size: 14px; padding-bottom: 8px;\">Trạng Thái:</td>"
                    + "          <td style=\"color: #4f46e5; font-size: 14px; font-weight: 600; text-align: right; padding-bottom: 8px;\">" + status + "</td>"
                    + "        </tr>"
                    + "        <tr>"
                    + "          <td style=\"color: #64748b; font-size: 14px;\">Hình Thức Giao Hàng:</td>"
                    + "          <td style=\"color: #0f172a; font-size: 14px; text-align: right;\">Vận chuyển nhanh (Express)</td>"
                    + "        </tr>"
                    + "      </table>"
                    + "    </div>"
                    + "    <p style=\"color: #475569; line-height: 1.6; font-size: 15px;\">" + descriptionDetail + "</p>"
                    + "    <div style=\"text-align: center; margin-top: 35px;\">"
                    + "      <a href=\"http://localhost:3000/order-history\" style=\"background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);\">Theo Dõi Đơn Hàng Của Bạn</a>"
                    + "    </div>"
                    + "  </div>"
                    + "  <div style=\"background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;\">"
                    + "    <p style=\"margin: 0;\">Email này được gửi tự động từ hệ thống thương mại điện tử PTIT.</p>"
                    + "    <p style=\"margin: 5px 0 0 0;\">© 2026 PTIT E-Commerce. All rights reserved.</p>"
                    + "  </div>"
                    + "</div>";

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("[Notification Service] Đã gửi EMAIL THẬT thành công tới: {}", toEmail);
        } catch (Exception e) {
            log.error("[Notification Service] Gửi EMAIL THẬT thất bại! Lỗi chi tiết: {}", e.getMessage());
        }
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_FAILED_QUEUE)
    public void consumeOrderFailedNotification(OrderCreatedEvent event) {
        log.info("[Notification Service] Nhận được sự kiện hủy đơn hàng (Saga Rollback) từ RabbitMQ: {}", event);

        if (event == null || event.getOrderId() == null || event.getUserId() == null) {
            log.warn("[Notification Service] Định dạng sự kiện hủy đơn hàng không hợp lệ. Hủy gửi thông báo.");
            return;
        }

        String email = "unknown@customer.com";
        String username = "Khách hàng thân thiết";

        try {
            String url = userServiceUrl + "/api/v1/auth/users/" + event.getUserId();
            log.info("[Notification Service] Đang truy vấn chi tiết khách hàng từ user-service cho ID: {} để báo hủy đơn", event.getUserId());
            UserResponse user = restTemplate.getForObject(url, UserResponse.class);
            if (user != null) {
                email = user.getEmail();
                username = user.getUsername();
            }
        } catch (Exception e) {
            log.error("[Notification Service] Lỗi truy vấn thông tin khách hàng: {}", e.getMessage());
        }

        // Print mock cancellation to console
        sendConsoleCancellationEmail(username, email, event.getOrderId());

        // Send real HTML cancellation email
        sendRealCancellationHtmlEmail(username, email, event.getOrderId());
    }

    private void sendConsoleCancellationEmail(String username, String email, Long orderId) {
        log.info("=========================================================================");
        log.info("📧 HỆ THỐNG GỬI EMAIL GIẢ LẬP - ĐANG GỬI THƯ BÁO HỦY ĐƠN HÀNG");
        log.info("-------------------------------------------------------------------------");
        log.info("Người nhận:  {} <{}>", username, email);
        log.info("Tiêu đề:     ❌ THÔNG BÁO HỦY ĐƠN HÀNG - Đơn hàng #{}", orderId);
        log.info("Nội dung:");
        log.info("    Xin chào {},", username);
        log.info("    ");
        log.info("    Chúng tôi rất tiếc phải thông báo rằng đơn hàng #{} của bạn", orderId);
        log.info("    đã bị hủy tự động trên hệ thống.");
        log.info("    Lý do: Không đủ tồn kho thực tế tại kho hàng.");
        log.info("    ");
        log.info("    Chúng tôi vô cùng xin lỗi vì sự cố bất tiện này và sẽ hoàn tiền lập tức");
        log.info("    nếu bạn đã thanh toán trước. Hy vọng sẽ được phục vụ bạn lần sau.");
        log.info("    ");
        log.info("    Trân trọng,");
        log.info("    Đội ngũ PTIT E-Commerce");
        log.info("=========================================================================");
    }

    private void sendRealCancellationHtmlEmail(String username, String toEmail, Long orderId) {
        if (senderEmail == null || senderEmail.trim().isEmpty() || senderEmail.contains("SMTP_USERNAME")) {
            log.info("[Notification Service] Chưa cấu hình SMTP_USERNAME thực tế. Bỏ qua luồng gửi email hủy thật.");
            return;
        }

        log.info("[Notification Service] Đang bắt đầu gửi EMAIL HỦY THẬT tới: {}", toEmail);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, "PTIT E-Commerce");
            helper.setTo(toEmail);
            helper.setSubject("❌ Thông Báo Hủy Đơn Hàng Tự Động - Đơn Hàng #" + orderId);

            String htmlContent = "<div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);\">"
                    + "  <div style=\"background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px 20px; text-align: center; color: white;\">"
                    + "    <h1 style=\"margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;\">PTIT E-COMMERCE</h1>"
                    + "    <p style=\"margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;\">Hệ thống phân tán hướng sự kiện chuyên nghiệp</p>"
                    + "  </div>"
                    + "  <div style=\"padding: 30px 25px; background-color: #ffffff;\">"
                    + "    <div style=\"text-align: center; margin-bottom: 25px;\">"
                    + "      <span style=\"background-color: #fef2f2; color: #991b1b; padding: 8px 16px; border-radius: 9999px; font-size: 13px; font-weight: 600; display: inline-block; border: 1px solid #fca5a5;\">❌ Đã Hủy Đơn Hàng</span>"
                    + "    </div>"
                    + "    <h2 style=\"color: #1e293b; font-size: 18px; margin-top: 0; font-weight: 600;\">Xin chào " + username + ",</h2>"
                    + "    <p style=\"color: #475569; line-height: 1.6; font-size: 15px;\">Chúng tôi rất tiếc phải thông báo rằng đơn hàng <strong>#" + orderId + "</strong> của bạn đã bị hủy tự động trên hệ thống.</p>"
                    + "    <div style=\"background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; padding: 20px; margin: 25px 0;\">"
                    + "      <table style=\"width: 100%; border-collapse: collapse;\">"
                    + "        <tr>"
                    + "          <td style=\"color: #64748b; font-size: 14px; padding-bottom: 8px;\">Mã Đơn Hàng:</td>"
                    + "          <td style=\"color: #0f172a; font-size: 14px; font-weight: 600; text-align: right; padding-bottom: 8px;\">#" + orderId + "</td>"
                    + "        </tr>"
                    + "        <tr>"
                    + "          <td style=\"color: #64748b; font-size: 14px; padding-bottom: 8px;\">Trạng Thái:</td>"
                    + "          <td style=\"color: #b91c1c; font-size: 14px; font-weight: 600; text-align: right; padding-bottom: 8px;\">CANCELLED</td>"
                    + "        </tr>"
                    + "        <tr>"
                    + "          <td style=\"color: #64748b; font-size: 14px;\">Lý Do Hủy:</td>"
                    + "          <td style=\"color: #b91c1c; font-size: 14px; font-weight: 600; text-align: right;\">Hết hàng tồn kho thực tế (Out of stock)</td>"
                    + "        </tr>"
                    + "      </table>"
                    + "    </div>"
                    + "    <p style=\"color: #475569; line-height: 1.6; font-size: 15px;\">Chúng tôi thành thật xin lỗi vì sự bất tiện này. Nếu đơn hàng của bạn đã được thanh toán trước qua các hình thức ví điện tử hoặc cổng thanh toán trực tuyến, hệ thống của chúng tôi sẽ tự động thực hiện hoàn tiền 100% lại cho bạn trong vòng 24 giờ.</p>"
                    + "    <p style=\"color: #475569; line-height: 1.6; font-size: 15px;\">Hy vọng sẽ được phục vụ bạn tốt hơn trong những đơn hàng tiếp theo!</p>"
                    + "  </div>"
                    + "  <div style=\"background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;\">"
                    + "    <p style=\"margin: 0;\">Email này được gửi tự động từ hệ thống thương mại điện tử PTIT.</p>"
                    + "    <p style=\"margin: 5px 0 0 0;\">© 2026 PTIT E-Commerce. All rights reserved.</p>"
                    + "  </div>"
                    + "</div>";

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("[Notification Service] Đã gửi EMAIL HỦY THẬT thành công tới: {}", toEmail);
        } catch (Exception e) {
            log.error("[Notification Service] Gửi EMAIL HỦY THẬT thất bại! Lỗi chi tiết: {}", e.getMessage());
        }
    }
}

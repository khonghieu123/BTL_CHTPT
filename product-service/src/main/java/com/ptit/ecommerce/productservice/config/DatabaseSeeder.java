package com.ptit.ecommerce.productservice.config;

import com.ptit.ecommerce.productservice.model.Product;
import com.ptit.ecommerce.productservice.model.ProductVariant;
import com.ptit.ecommerce.productservice.repository.ProductRepository;
import com.ptit.ecommerce.productservice.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    public void run(String... args) {
        log.info("[Product Service Seeder] Đang thiết lập cơ sở dữ liệu quy mô lớn (50 sản phẩm cao cấp)...");
        
        productVariantRepository.deleteAll();
        productRepository.deleteAll();

        // 1-10
        Product p1 = Product.builder()
                .name("MacBook Pro 16")
                .description("Chip Apple M3 Pro với 12-core CPU, 18-core GPU, màn hình Liquid Retina XDR tuyệt mỹ.")
                .price(new BigDecimal("59990000"))
                .stockQuantity(50)
                .sku("MAC-PRO-16")
                .imageUrl("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p2 = Product.builder()
                .name("iPhone 15 Pro Max")
                .description("Thiết kế vỏ Titan bền bỉ, chip A17 Pro siêu mạnh mẽ, camera zoom quang học 5x chuyên nghiệp.")
                .price(new BigDecimal("29990000"))
                .stockQuantity(100)
                .sku("IPHONE-15-PRO-MAX")
                .imageUrl("https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p3 = Product.builder()
                .name("Sony WH-1000XM5")
                .description("Chống ồn chủ động ANC thông minh hàng đầu, thời lượng pin cực khủng lên tới 30 giờ.")
                .price(new BigDecimal("6500000"))
                .stockQuantity(80)
                .sku("SONY-WH-XM5")
                .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p4 = Product.builder()
                .name("Kindle Paperwhite")
                .description("Màn hình e-ink 6.8 inch chống lóa mỏi mắt, điều chỉnh ánh sáng vàng ấm tùy chỉnh.")
                .price(new BigDecimal("3500000"))
                .stockQuantity(150)
                .sku("KINDLE-PW-11")
                .imageUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p5 = Product.builder()
                .name("iPad Air M2")
                .description("Chip Apple M2 cực mạnh mẽ, màn hình 11 inch Liquid Retina hiển thị siêu nét sắc sảo.")
                .price(new BigDecimal("14990000"))
                .stockQuantity(60)
                .sku("IPAD-AIR-M2")
                .imageUrl("https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p6 = Product.builder()
                .name("Dell XPS 15")
                .description("Màn hình 3.5K OLED cảm ứng tràn viền, bộ vi xử lý Intel Core i9, card đồ họa RTX 4060.")
                .price(new BigDecimal("45990000"))
                .stockQuantity(45)
                .sku("DELL-XPS-15")
                .imageUrl("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p7 = Product.builder()
                .name("Samsung Galaxy S24 Ultra")
                .description("Màn hình Dynamic AMOLED 2X rực rỡ, chip Snapdragon 8 Gen 3 cực mạnh, Camera AI 200MP.")
                .price(new BigDecimal("28990000"))
                .stockQuantity(90)
                .sku("SAMSUNG-S24U")
                .imageUrl("https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p8 = Product.builder()
                .name("Google Pixel 8 Pro")
                .description("Màn hình Super Actua sắc nét 120Hz, bộ xử lý AI Google Tensor G3 đỉnh cao nhiếp ảnh.")
                .price(new BigDecimal("19990000"))
                .stockQuantity(70)
                .sku("PIXEL-8-PRO")
                .imageUrl("https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p9 = Product.builder()
                .name("ASUS ROG Zephyrus G14")
                .description("Màn hình Nebula HDR 120Hz siêu nhạy, chip Ryzen 9 hiệu năng cao, card đồ họa RTX 4070.")
                .price(new BigDecimal("38990000"))
                .stockQuantity(30)
                .sku("ASUS-ROG-G14")
                .imageUrl("https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p10 = Product.builder()
                .name("Apple Watch Series 9")
                .description("Chip xử lý S9 SiP thông minh vượt trội, tính năng Double Tap chạm đúp độc đáo tiện lợi.")
                .price(new BigDecimal("9990000"))
                .stockQuantity(110)
                .sku("APPLE-WATCH-9")
                .imageUrl("https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop")
                .build();

        // 11-20
        Product p11 = Product.builder()
                .name("AirPods Pro 2nd Gen")
                .description("Công nghệ âm thanh thích ứng thế hệ mới, chống ồn chủ động gấp 2 lần so với đời đầu.")
                .price(new BigDecimal("5990000"))
                .stockQuantity(140)
                .sku("AIRPODS-PRO-2")
                .imageUrl("https://images.unsplash.com/photo-1588449668338-d1347b11a4ee?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p12 = Product.builder()
                .name("Keychron Q1 Pro")
                .description("Bàn phím cơ custom không dây vỏ nhôm đúc nguyên khối, hỗ trợ thay switch nóng QMK/VIA.")
                .price(new BigDecimal("4500000"))
                .stockQuantity(65)
                .sku("KEYCHRON-Q1P")
                .imageUrl("https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p13 = Product.builder()
                .name("Logitech MX Master 3S")
                .description("Chuột không dây công thái học đỉnh cao, mắt đọc 8K DPI siêu nhạy, con cuộn MagSpeed siêu nhanh.")
                .price(new BigDecimal("2490000"))
                .stockQuantity(200)
                .sku("LOGITECH-MX3S")
                .imageUrl("https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p14 = Product.builder()
                .name("PlayStation 5 Slim")
                .description("Máy chơi game Sony PS5 bản mỏng thế hệ mới, ổ cứng SSD tốc độ siêu cao 1TB, tay cầm DualSense.")
                .price(new BigDecimal("14490000"))
                .stockQuantity(85)
                .sku("PLAYSTATION-5")
                .imageUrl("https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p15 = Product.builder()
                .name("Nintendo Switch OLED")
                .description("Màn hình OLED 7-inch rực rỡ, chân đứng rộng có thể điều chỉnh, dock tích hợp cổng LAN.")
                .price(new BigDecimal("8490000"))
                .stockQuantity(120)
                .sku("NINTENDO-SWITCH")
                .imageUrl("https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p16 = Product.builder()
                .name("Samsung Galaxy Tab S9")
                .description("Màn hình Dynamic AMOLED 2X 11-inch siêu nét, chip Snapdragon 8 Gen 2 cực mạnh, kèm bút S-Pen.")
                .price(new BigDecimal("18990000"))
                .stockQuantity(55)
                .sku("SAMSUNG-TAB-S9")
                .imageUrl("https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p17 = Product.builder()
                .name("Sony Alpha 7 IV")
                .description("Máy ảnh Mirrorless Full-frame chuyên nghiệp, cảm biến Exmor R 33MP, quay phim chuẩn 4K 60p.")
                .price(new BigDecimal("58990000"))
                .stockQuantity(25)
                .sku("SONY-A7IV")
                .imageUrl("https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p18 = Product.builder()
                .name("Anker Prime Power Bank")
                .description("Sạc dự phòng cao cấp dung lượng 20,000mAh, công suất đầu ra cực lớn 200W, màn hình hiển thị LCD thông minh.")
                .price(new BigDecimal("2990000"))
                .stockQuantity(180)
                .sku("ANKER-PRIME-20K")
                .imageUrl("https://images.unsplash.com/photo-1609592424086-4b68ef530263?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p19 = Product.builder()
                .name("Philips Hue Starter Kit")
                .description("Bộ đèn LED thông minh A19 gồm 3 bóng màu rực rỡ và cục chuyển tiếp Hue Bridge điều khiển 16 triệu màu.")
                .price(new BigDecimal("4200000"))
                .stockQuantity(75)
                .sku("PHILIPS-HUE-KIT")
                .imageUrl("https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p20 = Product.builder()
                .name("Nintendo Controller Pro")
                .description("Tay cầm chơi game không dây cao cấp dành cho máy Switch, cảm giác cầm nắm đầm tay, hỗ trợ NFC.")
                .price(new BigDecimal("1890000"))
                .stockQuantity(160)
                .sku("NINTENDO-PRO-CTRL")
                .imageUrl("https://images.unsplash.com/photo-1592840496694-26d035b52b48?q=80&w=600&auto=format&fit=crop")
                .build();

        // 21-30
        Product p21 = Product.builder()
                .name("JBL Charge 5 Speaker")
                .description("Loa di động chống nước chuẩn IP67, công nghệ âm thanh JBL Original Pro Sound, pin dùng liên tục 20 giờ.")
                .price(new BigDecimal("3990000"))
                .stockQuantity(95)
                .sku("JBL-CHARGE-5")
                .imageUrl("https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p22 = Product.builder()
                .name("Logitech G Pro X Superlight")
                .description("Chuột gaming không dây siêu nhẹ chỉ 63g dành cho game thủ chuyên nghiệp, cảm biến HERO 25K.")
                .price(new BigDecimal("3290000"))
                .stockQuantity(105)
                .sku("LOGITECH-GPX-SL")
                .imageUrl("https://images.unsplash.com/photo-1625842268584-8f3290455655?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p23 = Product.builder()
                .name("Keychron K2 V2 Keyboard")
                .description("Bàn phím cơ không dây layout 75% gọn gàng, hỗ trợ cả MacOS và Windows, switch cơ học Gateron.")
                .price(new BigDecimal("1990000"))
                .stockQuantity(145)
                .sku("KEYCHRON-K2")
                .imageUrl("https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p24 = Product.builder()
                .name("Elgato Stream Deck MK.2")
                .description("Bàn điều khiển Studio gồm 15 phím LCD có thể tùy biến vô hạn, công cụ tối ưu cho streamer.")
                .price(new BigDecimal("3790000"))
                .stockQuantity(40)
                .sku("ELGATO-SD-MK2")
                .imageUrl("https://images.unsplash.com/photo-1600541519468-4a74a6199644?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p25 = Product.builder()
                .name("Razer DeathAdder V3 Pro")
                .description("Chuột chơi game không dây công thái học siêu nhẹ 63g, công nghệ không dây HyperSpeed 4000Hz.")
                .price(new BigDecimal("3490000"))
                .stockQuantity(85)
                .sku("RAZER-DA-V3P")
                .imageUrl("https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p26 = Product.builder()
                .name("Apple Watch Ultra 2")
                .description("Đồng hồ thể thao chuyên nghiệp vỏ Titan siêu bền, GPS tần số kép siêu chính xác, pin dùng đến 36 giờ.")
                .price(new BigDecimal("21990000"))
                .stockQuantity(35)
                .sku("APPLE-WATCH-ULTRA2")
                .imageUrl("https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p27 = Product.builder()
                .name("ASUS ROG Ally Handheld")
                .description("Máy chơi game cầm tay chạy Windows 11, trang bị chip AMD Ryzen Z1 Extreme, màn hình 120Hz.")
                .price(new BigDecimal("16990000"))
                .stockQuantity(50)
                .sku("ASUS-ROG-ALLY")
                .imageUrl("https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p28 = Product.builder()
                .name("SteelSeries Arctis Nova Pro")
                .description("Tai nghe gaming chụp tai cao cấp, màng loa chuẩn Hi-Res Audio, chống ồn chủ động ANC.")
                .price(new BigDecimal("8990000"))
                .stockQuantity(45)
                .sku("STEELSERIES-ANP")
                .imageUrl("https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p29 = Product.builder()
                .name("Dell UltraSharp 27 Monitor")
                .description("Màn hình đồ họa cao cấp 27 inch 4K IPS Black, độ bao phủ màu 98% DCI-P3, sạc USB-C 90W.")
                .price(new BigDecimal("11490000"))
                .stockQuantity(30)
                .sku("DELL-U2723QE")
                .imageUrl("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p30 = Product.builder()
                .name("Elgato Wave:3 Microphone")
                .description("Micro condenser chuyên nghiệp thu âm chuẩn studio, tích hợp bàn trộn âm kỹ thuật số Wave Link.")
                .price(new BigDecimal("3990000"))
                .stockQuantity(70)
                .sku("ELGATO-WAVE3")
                .imageUrl("https://images.unsplash.com/photo-1590608897129-79da98d15969?q=80&w=600&auto=format&fit=crop")
                .build();

        // 31-40
        Product p31 = Product.builder()
                .name("Marshall Acton III Speaker")
                .description("Loa bluetooth gia đình cổ điển chất âm Marshall đẳng cấp, công suất 60W ngập tràn phòng.")
                .price(new BigDecimal("7490000"))
                .stockQuantity(50)
                .sku("MARSHALL-ACTON-3")
                .imageUrl("https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p32 = Product.builder()
                .name("Keychron K8 Pro Keyboard")
                .description("Bàn phím cơ không dây tenkeyless mạch xuôi, hotswap nhanh, có sẵn foam cách âm tiêu âm.")
                .price(new BigDecimal("2890000"))
                .stockQuantity(75)
                .sku("KEYCHRON-K8P")
                .imageUrl("https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p33 = Product.builder()
                .name("Logitech G502 X Plus")
                .description("Chuột chơi game không dây huyền thoại, mắt đọc HERO 25K siêu cấp, hệ thống LED RGB Lightsync.")
                .price(new BigDecimal("3590000"))
                .stockQuantity(90)
                .sku("LOGITECH-G502XP")
                .imageUrl("https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p34 = Product.builder()
                .name("Razer BlackWidow V4 Pro")
                .description("Bàn phím cơ cao cấp dành cho game thủ, Green Switch giòn giã, dải LED gầm RGB rực rỡ.")
                .price(new BigDecimal("5990000"))
                .stockQuantity(35)
                .sku("RAZER-BW-V4P")
                .imageUrl("https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p35 = Product.builder()
                .name("Elgato Key Light Air")
                .description("Đèn LED chuyên dụng cho livestream và họp trực tuyến, điều chỉnh độ sáng và nhiệt độ màu qua app.")
                .price(new BigDecimal("3290000"))
                .stockQuantity(40)
                .sku("ELGATO-KL-AIR")
                .imageUrl("https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p36 = Product.builder()
                .name("JBL Clip 4 Portable")
                .description("Loa bluetooth siêu di động móc treo tiện lợi, chống nước chống bụi chuẩn IP67 cá tính.")
                .price(new BigDecimal("1590000"))
                .stockQuantity(130)
                .sku("JBL-CLIP-4")
                .imageUrl("https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p37 = Product.builder()
                .name("Samsung Galaxy Watch 6")
                .description("Đồng hồ thông minh theo dõi chỉ số sức khỏe, giấc ngủ chi tiết, thiết kế viền mỏng thanh lịch.")
                .price(new BigDecimal("5490000"))
                .stockQuantity(90)
                .sku("SAMSUNG-WATCH-6")
                .imageUrl("https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p38 = Product.builder()
                .name("GoPro HERO12 Black")
                .description("Camera hành trình chống rung HyperSmooth 6.0, quay video chuẩn 5.3K HDR sắc nét dã ngoại.")
                .price(new BigDecimal("10490000"))
                .stockQuantity(50)
                .sku("GOPRO-HERO12")
                .imageUrl("https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p39 = Product.builder()
                .name("DJI Mini 4 Pro Fly")
                .description("Flycam mini trọng lượng siêu nhẹ dưới 249g, cảm biến vật cản đa hướng, quay video dọc 4K HDR.")
                .price(new BigDecimal("21990000"))
                .stockQuantity(20)
                .sku("DJI-MINI-4P")
                .imageUrl("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p40 = Product.builder()
                .name("Shure SM7B Microphone")
                .description("Microphone dynamic huyền thoại cho thu âm studio, podcast, loại bỏ tiếng ồn cơ học cực đỉnh.")
                .price(new BigDecimal("10990000"))
                .stockQuantity(30)
                .sku("SHURE-SM7B")
                .imageUrl("https://images.unsplash.com/photo-1590608897129-79da98d15969?q=80&w=600&auto=format&fit=crop")
                .build();

        // 41-50
        Product p41 = Product.builder()
                .name("Focusrite Scarlett 2i2")
                .description("Soundcard thu âm chuyên nghiệp thế hệ 4, tiền khuếch đại mic cực sạch, tính năng Auto Gain tiện lợi.")
                .price(new BigDecimal("5490000"))
                .stockQuantity(60)
                .sku("FOCUSRITE-2I2-G4")
                .imageUrl("https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p42 = Product.builder()
                .name("Sony HT-S20R Soundbar")
                .description("Hệ thống loa thanh rạp hát tại gia 5.1 kênh âm thanh vòm thực tế công suất lớn 400W.")
                .price(new BigDecimal("4290000"))
                .stockQuantity(40)
                .sku("SONY-HT-S20R")
                .imageUrl("https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p43 = Product.builder()
                .name("Logitech C922 Pro")
                .description("Webcam truyền phát trực tuyến Full HD 1080p sắc nét, tự động cân bằng ánh sáng phòng.")
                .price(new BigDecimal("2290000"))
                .stockQuantity(120)
                .sku("LOGITECH-C922")
                .imageUrl("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p44 = Product.builder()
                .name("Razer Leviathan V2 X")
                .description("Loa soundbar gaming mini hỗ trợ cổng USB Type-C, dải đèn led RGB Chroma biến ảo rực rỡ.")
                .price(new BigDecimal("2990000"))
                .stockQuantity(65)
                .sku("RAZER-LEVIATHAN-V2X")
                .imageUrl("https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p45 = Product.builder()
                .name("Apple MagSafe Charger")
                .description("Sạc không dây Apple chính hãng hít nam châm chuẩn sạc nhanh MagSafe lên tới 15W tiện dụng.")
                .price(new BigDecimal("1190000"))
                .stockQuantity(250)
                .sku("APPLE-MAGSAFE")
                .imageUrl("https://images.unsplash.com/photo-1609592424086-4b68ef530263?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p46 = Product.builder()
                .name("Anker Nano II 65W")
                .description("Củ sạc siêu nhỏ gọn công nghệ GaN II sạc nhanh cho cả điện thoại, iPad, laptop cổng USB-C.")
                .price(new BigDecimal("890000"))
                .stockQuantity(300)
                .sku("ANKER-NANO2-65W")
                .imageUrl("https://images.unsplash.com/photo-1609592424086-4b68ef530263?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p47 = Product.builder()
                .name("Belkin 3-in-1 Wireless")
                .description("Đế sạc không dây cao cấp MagSafe 3 trong 1 sạc nhanh cùng lúc iPhone, Apple Watch và AirPods.")
                .price(new BigDecimal("3490000"))
                .stockQuantity(80)
                .sku("BELKIN-3IN1")
                .imageUrl("https://images.unsplash.com/photo-1609592424086-4b68ef530263?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p48 = Product.builder()
                .name("Corsair K70 RGB PRO")
                .description("Bàn phím cơ chơi game huyền thoại vỏ nhôm xước sang trọng, switch Cherry MX bền bỉ 100 triệu lần nhấn.")
                .price(new BigDecimal("3990000"))
                .stockQuantity(55)
                .sku("CORSAIR-K70-PRO")
                .imageUrl("https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p49 = Product.builder()
                .name("ASUS ROG Swift 32")
                .description("Màn hình gaming cao cấp 32-inch 4K UHD 144Hz chuyên game tốc độ cao, hỗ trợ HDR600.")
                .price(new BigDecimal("24990000"))
                .stockQuantity(25)
                .sku("ASUS-ROG-PG32UQ")
                .imageUrl("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop")
                .build();

        Product p50 = Product.builder()
                .name("HyperX QuadCast S")
                .description("Microphone condenser gaming trang bị đèn LED RGB rực rỡ, tích hợp bộ chống rung và lọc âm.")
                .price(new BigDecimal("3890000"))
                .stockQuantity(80)
                .sku("HYPERX-QUADCAST-S")
                .imageUrl("https://images.unsplash.com/photo-1590608897129-79da98d15969?q=80&w=600&auto=format&fit=crop")
                .build();

        // Save all 50 products
        List<Product> seededProducts = productRepository.saveAll(Arrays.asList(
                p1, p2, p3, p4, p5, p6, p7, p8, p9, p10,
                p11, p12, p13, p14, p15, p16, p17, p18, p19, p20,
                p21, p22, p23, p24, p25, p26, p27, p28, p29, p30,
                p31, p32, p33, p34, p35, p36, p37, p38, p39, p40,
                p41, p42, p43, p44, p45, p46, p47, p48, p49, p50
        ));

        // Variants for MacBook Pro 16 (p1)
        ProductVariant mv1 = ProductVariant.builder()
                .product(p1)
                .capacity("18GB RAM | 512GB SSD")
                .color("Space Grey")
                .priceOffset(new BigDecimal("0"))
                .stockQuantity(20)
                .build();
        ProductVariant mv2 = ProductVariant.builder()
                .product(p1)
                .capacity("36GB RAM | 1TB SSD")
                .color("Space Grey")
                .priceOffset(new BigDecimal("15000000"))
                .stockQuantity(15)
                .build();
        ProductVariant mv3 = ProductVariant.builder()
                .product(p1)
                .capacity("48GB RAM | 2TB SSD")
                .color("Silver")
                .priceOffset(new BigDecimal("32000000"))
                .stockQuantity(15)
                .build();

        // Variants for iPhone 15 Pro Max (p2)
        ProductVariant iv1 = ProductVariant.builder()
                .product(p2)
                .capacity("256GB")
                .color("Titan Tự Nhiên")
                .priceOffset(new BigDecimal("0"))
                .stockQuantity(30)
                .build();
        ProductVariant iv2 = ProductVariant.builder()
                .product(p2)
                .capacity("256GB")
                .color("Titan Đen")
                .priceOffset(new BigDecimal("0"))
                .stockQuantity(20)
                .build();
        ProductVariant iv3 = ProductVariant.builder()
                .product(p2)
                .capacity("512GB")
                .color("Titan Tự Nhiên")
                .priceOffset(new BigDecimal("5000000"))
                .stockQuantity(25)
                .build();
        ProductVariant iv4 = ProductVariant.builder()
                .product(p2)
                .capacity("512GB")
                .color("Titan Đen")
                .priceOffset(new BigDecimal("5000000"))
                .stockQuantity(25)
                .build();
        ProductVariant iv5 = ProductVariant.builder()
                .product(p2)
                .capacity("1TB")
                .color("Titan Đen")
                .priceOffset(new BigDecimal("11000000"))
                .stockQuantity(10)
                .build();

        // Variants for Samsung Galaxy S24 Ultra (p7)
        ProductVariant sv1 = ProductVariant.builder()
                .product(p7)
                .capacity("256GB")
                .color("Titan Gray")
                .priceOffset(new BigDecimal("0"))
                .stockQuantity(40)
                .build();
        ProductVariant sv2 = ProductVariant.builder()
                .product(p7)
                .capacity("512GB")
                .color("Titan Gray")
                .priceOffset(new BigDecimal("4500000"))
                .stockQuantity(30)
                .build();
        ProductVariant sv3 = ProductVariant.builder()
                .product(p7)
                .capacity("1TB")
                .color("Titan Black")
                .priceOffset(new BigDecimal("9500000"))
                .stockQuantity(20)
                .build();

        productVariantRepository.saveAll(Arrays.asList(
                mv1, mv2, mv3, iv1, iv2, iv3, iv4, iv5, sv1, sv2, sv3
        ));

        log.info("[Product Service Seeder] Đã nạp thành công đầy đủ 50 sản phẩm công nghệ cùng 11 biến thể tối tân vào database Postgres.");
    }
}

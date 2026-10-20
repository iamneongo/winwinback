# SEO Module P0

## Kiến trúc và dữ liệu

CMS hiện dùng Next.js 16 App Router, Tiptap 3, React state trong `ArticleEditor`, server actions có `requireAdmin`, Neon Postgres và Drizzle. SEO P0 giữ nguyên editor, luồng lưu nháp/xuất bản và cấu trúc hai cột. Editor hiện có hai tab Bài viết và SEO; tab AI thủ công đã được gỡ theo yêu cầu sau này.

Trường SEO mở rộng trong `articles.seo` JSONB và `article_drafts.document.seo` JSONB hiện có. `articles.meta_description` và `articles.slug` vẫn là trường nguồn như trước để tránh phân đôi dữ liệu. Tên TypeScript tương ứng: `title` = meta title, `keyword` = focus keyword, `canonical` = canonical URL, `noindex` = nghịch đảo robots index, `follow` = robots follow, `socialTitle`/`socialDescription`/`socialImage` = OG. `secondaryKeywords` là mảng; giá trị chuỗi cũ được chuẩn hóa khi đọc. Các trường mới mặc định tương thích bài cũ.

Tiêu đề SEO hiệu lực được xuất nguyên văn trong thẻ `<title>` và preview; hệ thống không tự nối tên thương hiệu. Mẫu SEO có thể thêm `| Win-Win Back` khi người biên tập muốn, tránh lặp hậu tố với tiêu đề tùy chỉnh.

`seo-engine.ts` phân tích nội dung đã chuẩn hóa bằng một lượt parse HTML, không gọi database hay AI. Cùng kết quả này tạo score và checklist. 13 rule có tổng trọng số 100; rule không áp dụng được loại khỏi mẫu số. Ngưỡng tiêu đề/mô tả và độ dài bài là gợi ý biên tập, không dùng làm điều kiện xuất bản. Điểm không phải điểm Google. Ở client, phân tích chạy sau 400 ms ngừng nhập, độc lập với autosave 1,8 giây. Trường SEO được lưu cùng document và revision; bài public chỉ đổi sau khi chọn Xuất bản/Cập nhật.

`seo-public.ts` là nguồn fallback duy nhất cho `generateMetadata`, JSON-LD và sitemap. `article_slugs`/`src/proxy.ts` tiếp tục quản lý URL cũ và redirect 301, không tạo bộ redirect mới. Trang nháp/ẩn không được public; bài noindex hoặc canonical sang URL khác không được đưa vào sitemap.

## Migration và rollback

Trước khi chạy trên bất kỳ môi trường nào, tạo bản sao lưu Neon hoặc snapshot database và xác nhận `DATABASE_URL` trỏ đúng môi trường. Chạy migration rõ ràng, một lần trên từng database, **trước khi deploy phiên bản dùng SEO P0**:

```powershell
npm run db:migrate-seo-p0
```

Migration có transaction, advisory lock và ledger `app_migrations`; chỉ bổ sung `follow: true` và `schemaType: Article` khi bản ghi SEO hiện tại thiếu, không xóa dữ liệu hoặc ghi lại draft/version cũ. Chạy lại sẽ báo đã áp dụng. Vì schema đã có JSONB, không có `ALTER TABLE` mới. Chưa chạy migration trên production chỉ bằng việc build ứng dụng.

Rollback ứng dụng: deploy lại phiên bản cũ; các khóa JSONB mới không làm mất khả năng đọc các trường cũ. **Không xóa mặc định** dữ liệu SEO mới. Nếu bắt buộc rollback dữ liệu, khôi phục snapshot trước migration sau khi đánh giá các thay đổi bài viết phát sinh trong khoảng thời gian đó; không chạy lệnh xóa đại trà.

## Kiểm tra tự động

```powershell
npm run test:seo
npm run test:articles
npm run typecheck
npm run lint
npm run build
```

Benchmark 5.000 từ trong `tests/seo-module.test.ts` kiểm tra p95 dưới 100 ms ở môi trường chạy test; nên đo lại trên máy biên tập thực tế nếu phần cứng thấp. Rule mới: thêm trong `analyzeSeo` với ID duy nhất, nhóm, trọng số, trạng thái N/A, gợi ý và `targetField`; bổ sung test cho trường hợp pass/fail/N/A. Không lưu score vào database.

## Nghiệm thu thủ công

1. Đăng nhập admin, tạo nháp, nhập title, mô tả, từ khóa phụ, canonical, robots và OG; chờ trạng thái Đã lưu, tải lại, kiểm tra toàn bộ dữ liệu còn nguyên. Dùng hai tab sửa cùng bài và xác nhận tab lưu sau nhận cảnh báo revision, không ghi đè im lặng.
2. Thử các trường hợp thiếu nội dung, HTML dán sai, hình thiếu alt, link nội bộ, H2/H3; kiểm tra score và checklist sau 400 ms, click cảnh báo đưa đến đúng trường hoặc editor. Đổi Desktop/Mobile ở preview; thử trên màn hình hẹp và bằng bàn phím.
3. Xuất bản một bài thử. Xem HTML public để xác nhận title, description, canonical, robots, OG, Twitter và JSON-LD Article/BreadcrumbList dùng dữ liệu thật. Bản nháp không mở công khai.
4. Bật noindex, cập nhật, xác nhận robots noindex và URL vắng trong `/sitemap.xml`. Thử canonical ngoài URL chuẩn và xác nhận cũng vắng trong sitemap.
5. Đổi slug của bài public, cập nhật, xác nhận URL cũ redirect 301 tới slug mới, URL mới hoạt động và canonical/sitemap phản ánh slug mới. Thử slug đã dùng để xác nhận server từ chối.
6. Đăng nhập tài khoản không phải admin và thử thao tác lưu bài: server action phải từ chối.

## Giới hạn P0

Không có Google Search Console, theo dõi thứ hạng, audit toàn site, AI SEO mới hoặc backlink. Preview Google chỉ là mô phỏng. Keyword frequency không áp đặt mật độ. Các bài cũ có ảnh/HTML legacy được giữ nguyên; lỗi dữ liệu lịch sử cần được xử lý riêng nếu phát hiện khi nghiệm thu.

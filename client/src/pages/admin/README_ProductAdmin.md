# ProductAdmin Component

## Mô tả

Component quản lý sản phẩm với đầy đủ chức năng CRUD (Create, Read, Update, Delete) sử dụng Ant Design và Tailwind CSS.

## Tính năng

### 1. Hiển thị danh sách sản phẩm

-   Bảng danh sách với pagination
-   Hiển thị hình ảnh, tên, danh mục, giá, giảm giá, trạng thái, nổi bật
-   Responsive design với scroll ngang

### 2. Thêm sản phẩm mới

-   Form nhập thông tin sản phẩm:
    -   Tên sản phẩm (bắt buộc)
    -   Danh mục (bắt buộc)
    -   Giá (bắt buộc)
    -   Giảm giá (%)
    -   Mô tả
    -   Trạng thái (Hoạt động/Không hoạt động)
    -   Sản phẩm nổi bật (Switch)
-   Upload nhiều ảnh sản phẩm
-   Quản lý kích thước và tồn kho

### 3. Chỉnh sửa sản phẩm

-   Form tương tự như thêm mới
-   Tự động load dữ liệu hiện tại
-   Cập nhật thông tin

### 4. Xóa sản phẩm

-   Confirmation dialog trước khi xóa
-   Xóa an toàn với xác nhận

### 5. Upload ảnh

-   Upload nhiều ảnh cùng lúc
-   Hiển thị preview ảnh đã upload
-   Tích hợp với API upload

## Cấu trúc dữ liệu

### Product Model

```javascript
{
  name: String (required),
  category: ObjectId (required),
  price: Number (required),
  discount: Number (default: 0),
  description: String,
  colors: [{
    name: String,
    code: String,
    images: String
  }],
  variants: [{
    size: String (required),
    stock: Number (default: 0)
  }],
  isFeatured: Boolean (default: false),
  status: String (enum: ['active', 'inactive'], default: 'active')
}
```

## API Endpoints

### Product APIs

-   `GET /api/product/all` - Lấy danh sách sản phẩm
-   `POST /api/product/create` - Tạo sản phẩm mới
-   `PUT /api/product/update/:id` - Cập nhật sản phẩm
-   `DELETE /api/product/delete/:id` - Xóa sản phẩm
-   `POST /api/product/upload-image` - Upload ảnh

### Category APIs

-   `GET /api/category/all` - Lấy danh sách danh mục

## Cách sử dụng

```jsx
import ProductAdmin from './components/ProductAdmin';

function App() {
    return (
        <div>
            <ProductAdmin />
        </div>
    );
}
```

## Dependencies

### Ant Design Components

-   Table, Button, Modal, Form, Input, Select, InputNumber
-   Switch, Upload, message, Popconfirm, Tag, Space
-   Card, Row, Col, Divider, List

### Icons

-   PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined

### API Requests

-   ProductRequest: requestGetAllProduct, requestCreateProduct, requestUpdateProduct, requestDeleteProduct, requestUploadImage
-   CategoryRequest: requestGetAllCategory

## Styling

-   Sử dụng Tailwind CSS cho styling
-   Responsive design
-   Modern UI với Ant Design components
-   Custom colors và spacing

## Lưu ý

-   Cần có authentication token để thực hiện các thao tác CRUD
-   API endpoints cần được cấu hình đúng
-   Upload ảnh cần có multer middleware ở backend
-   Component tự động load danh sách sản phẩm và danh mục khi mount










const BlogService = require('../services/blog.service');

const { BadRequestError } = require('../core/error.response');
const { OK, Created } = require('../core/success.response');

class BlogController {
    async uploadImage(req, res, next) {
        const file = req.file;
        const result = await BlogService.uploadImage(file);
        new OK({
            message: 'Tải lên ảnh thành công',
            metadata: result,
        }).send(res);
    }

    async createBlog(req, res, next) {
        const { title, content, image } = req.body;
        if (!title || !content || !image) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const blog = await BlogService.createBlog({ title, content, image });
        new Created({
            message: 'Tạo bài viết thành công',
            metadata: blog,
        }).send(res);
    }

    async getAllBlog(req, res, next) {
        const blogs = await BlogService.findAll();
        new OK({
            message: 'Lấy tất cả bài viết thành công',
            metadata: blogs,
        }).send(res);
    }

    async updateBlog(req, res, next) {
        const { title, content, image, id } = req.body;
        if (!title || !content || !image || !id) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const blog = await BlogService.updateBlog({ id, title, content, image });
        new OK({
            message: 'Cập nhật bài viết thành công',
            metadata: blog,
        }).send(res);
    }

    async deleteBlog(req, res, next) {
        const { id } = req.body;
        if (!id) {
            throw new BadRequestError('Vui lòng nhập id');
        }
        const blog = await BlogService.deleteBlog(id);
        new OK({
            message: 'Xóa bài viết thành công',
            metadata: blog,
        }).send(res);
    }

    async getBlogById(req, res, next) {
        const { id } = req.query;
        const blog = await BlogService.getBlogById(id);
        new OK({
            message: 'Lấy bài viết thành công',
            metadata: blog,
        }).send(res);
    }
}

module.exports = new BlogController();

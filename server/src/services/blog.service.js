const modelBlog = require('../models/blog.model');

class BlogService {
    async uploadImage(file) {
        return file.filename;
    }

    async createBlog(data) {
        const blog = await modelBlog.create(data);
        return blog;
    }

    async findAll() {
        const blogs = await modelBlog.find().sort({ createdAt: -1 });
        return blogs;
    }

    async updateBlog(data) {
        const blog = await modelBlog.findByIdAndUpdate(data.id, data);
        return blog;
    }

    async deleteBlog(id) {
        const blog = await modelBlog.findByIdAndDelete(id);
        return blog;
    }

    async getBlogById(id) {
        const blog = await modelBlog.findById(id);
        return blog;
    }
}

module.exports = new BlogService();

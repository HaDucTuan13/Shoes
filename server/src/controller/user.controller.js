const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');
const UserService = require('../services/users.service');

function setCookie(res, token, refreshToken) {
    // Cookie token
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 15 * 60 * 1000,
    });

    // Cookie trạng thái login
    res.cookie('logged', 1, {
        httpOnly: false,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Cookie refreshToken
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

class UserController {
    async createUser(req, res) {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }

        const { token, refreshToken } = await UserService.createUser({ fullName, email, password });

        setCookie(res, token, refreshToken);

        const data = {
            token,
            refreshToken,
        };

        return new OK({ message: 'Tạo user thành công', metadata: data }).send(res);
    }

    async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const data = {
            email,
            password,
        };
        const { token, refreshToken } = await UserService.login(data);

        setCookie(res, token, refreshToken);
        return new OK({ message: 'success', metadata: { token, refreshToken } }).send(res);
    }

    async auth(req, res) {
        const { id } = req.user;
        const data = await UserService.authUser(id);
        new OK({
            message: 'success',
            metadata: data,
        }).send(res);
    }

    async logout(req, res) {
        const { id } = req.user;
        const { status } = await UserService.logout(id);
        if (status === 200) {
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            res.clearCookie('logged');
            return new OK({ message: 'success' }).send(res);
        } else {
            throw new BadRequestError('Đăng xuất thất bại');
        }
    }

    async refreshToken(req, res) {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            throw new BadRequestError('Vui lòng đăng nhập lại');
        }
        const { token } = await UserService.refreshToken(refreshToken);

        res.cookie('token', token, {
            httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        res.cookie('logged', 1, {
            httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        const data = {
            token,
        };

        return new OK({ message: 'success', metadata: data }).send(res);
    }

    async getAllUser(req, res) {
        const data = await UserService.getAllUser(req, res);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async updateUserAdmin(req, res) {
        const { id } = req.params;
        const data = await UserService.updateUserAdmin(id, req.body);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async deleteUser(req, res) {
        const { id } = req.params;
        const data = await UserService.deleteUser(id);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async changePassword(req, res) {
        const { id } = req.user;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const data = {
            currentPassword,
            newPassword,
        };
        const newData = await UserService.changePassword(id, data);
        new OK({ message: 'success', metadata: newData }).send(res);
    }

    async updateUser(req, res) {
        const { id } = req.user;
        const { fullName, address, phone, birthDay, email } = req.body;

        const data = {
            fullName,
            address,
            phone,
            birthDay,
            email,
        };
        const newData = await UserService.updateUser(id, data);
        new OK({ message: 'success', metadata: newData }).send(res);
    }

    async uploadAvatar(req, res) {
        const { id } = req.user;
        const { filename } = req.file;
        const data = await UserService.uploadAvatar(id, filename);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async getDashboard(req, res) {
        try {
            const data = await UserService.getDashboard();
            new OK({ message: 'success', metadata: data }).send(res);
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    async loginGoogle(req, res) {
        const { credential } = req.body;
        const { token, refreshToken } = await UserService.loginGoogle(credential);
        setCookie(res, token, refreshToken);
        new OK({ message: 'success', metadata: { token, refreshToken } }).send(res);
    }

    async forgotPassword(req, res) {
        const { email } = req.body;
        const { token, otp } = await UserService.forgotPassword(email);
        res.cookie('tokenResetPassword', token, {
            httpOnly: false,
            secure: true,
            sameSite: 'Strict',
            maxAge: 10 * 60 * 1000,
        });
        new OK({ message: 'success', metadata: { token, otp } }).send(res);
    }

    async resetPassword(req, res) {
        const token = req.cookies.tokenResetPassword;
        const { otp, newPassword } = req.body;
        const data = await UserService.resetPassword(token, otp, newPassword);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async chatbot(req, res) {
        const { id } = req.user;
        const { question } = req.body;
        const data = await UserService.chatbot(question, id);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async getMessageChatbot(req, res) {
        const { id } = req.user;
        const data = await UserService.getMessageChatbot(id);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async getDashboardAdmin(req, res) {
        const data = await UserService.getDashboardAdmin();
        new OK({ message: 'success', metadata: data }).send(res);
    }
}

module.exports = new UserController();

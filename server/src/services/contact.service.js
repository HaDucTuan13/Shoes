const modelContact = require('../models/contact.model');

class ContactService {
    async create(userId, fullName, email, phone, message) {
        const contact = await modelContact.create({ userId, fullName, email, phone, message });
        return contact;
    }

    async getAll() {
        const contacts = await modelContact.find();
        return contacts;
    }

    async updateStatus(id, status) {
        const contact = await modelContact.findByIdAndUpdate(id, { status });
        return contact;
    }
}

module.exports = new ContactService();

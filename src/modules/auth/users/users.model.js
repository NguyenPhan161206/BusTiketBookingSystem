const db = require('../../../db/knex');
const { paginate } = require('../../../utils/paginate');

const TABLE = 'users';

const UserModel = {
  findById(id) {
    return db(TABLE).where({ id }).first();
  },

  findByEmail(email) {
    if (!email) return null;
    return db(TABLE).whereRaw('LOWER(email) = LOWER(?)', [email.trim()]).first();
  },

  findByVerificationToken(token) {
    if (!token) return null;
    return db(TABLE).where({ email_verification_token: token }).first();
  },

  findByResetToken(token) {
    if (!token) return null;
    return db(TABLE)
      .where({ password_reset_token: token })
      .andWhere('password_reset_expires_at', '>', new Date())
      .first();
  },

  async create(data) {
    const [user] = await db(TABLE)
      .insert({
        ...data,
        email: data.email ? data.email.trim().toLowerCase() : data.email,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');
    return user;
  },

  async update(id, data) {
    const [user] = await db(TABLE)
      .where({ id })
      .update({
        ...data,
        updated_at: new Date(),
      })
      .returning('*');
    return user;
  },

  list({ page = 1, perPage = 10, search = '', role = '', status = '' } = {}) {
    let query = db(TABLE).select(
      'id',
      'email',
      'full_name',
      'phone',
      'role',
      'is_active',
      'email_verified_at',
      'created_at',
      'updated_at',
    );

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      query = query.where((builder) => {
        builder.whereILike('full_name', q).orWhereILike('email', q).orWhereILike('phone', q);
      });
    }

    if (role && role !== 'all') {
      query = query.where({ role });
    }

    if (status && status !== 'all') {
      query = query.where({ is_active: status === 'active' });
    }

    query = query.orderBy('created_at', 'desc');

    return paginate(query, { page, perPage });
  },

  count() {
    return db(TABLE).count('* as total').first();
  },
};

module.exports = UserModel;

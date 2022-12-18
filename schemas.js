const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});


const Joi = BaseJoi.extend(extension)


module.exports.validate_share_schema = Joi.object({
    post_text: Joi.string().min(10).max(1000).required().escapeHTML(),
});

module.exports.validate_comment_schema = Joi.object({
    comment_text: Joi.string().min(5).max(500).required().escapeHTML(),
});
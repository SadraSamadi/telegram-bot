const schedule = require('node-schedule');
const moment = require('moment-timezone');
const Handlebars = require('handlebars');
const Telegraf = require('telegraf');
const fse = require('fs-extra');
const path = require('path');

const bot = new Telegraf(process.env.BOT_TOKEN);

function messageTemplate() {
    let file = path.join(__dirname, 'message.hbs');
    let data = fse.readFileSync(file);
    let template = data.toString();
    return Handlebars.compile(template);
}

bot.start(ctx => {
    let id = ctx.chat.id.toString();
    let template = messageTemplate();
    schedule.cancelJob(id);
    let job = schedule.scheduleJob(id, process.env.SCHEDULE_CRON, () => {
        let time = moment().tz('Asia/Tehran').format('YYYY MMMM DD, HH:mm:ss');
        let message = template({time});
        ctx.replyWithHTML(message)
            .then(() => console.log('[%s] message sent', time))
            .catch(err => console.log('[%s] message not sent : %s', time, err.message));
    });
    job.invoke();
    console.log('session started : %d', id);
});

bot.command('cancel', ctx => {
    let id = ctx.chat.id.toString();
    schedule.cancelJob(id);
    console.log('session stopped : %d', id);
});

bot.startPolling();

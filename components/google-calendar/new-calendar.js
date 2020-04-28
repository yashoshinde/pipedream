const _ = require("lodash")
const googleCalendar = require("https://raw.githubusercontent.com/PipedreamHQ/pipedream/google-calendar/components/google-calendar/google-calendar.app.js")

module.exports = {
  name: 'google-calendar-new-calendar',
  version: '0.0.1',
  props: {
    db: '$.service.db',
    googleCalendar,
    timer: {
      type: "$.interface.timer",
      default: {
        intervalSeconds: 5 * 60,
      },
    },
  },
  hooks: {
    async activate() {
      // get list of calendars
      const calListResp = await this.googleCalendar.calendarList()
      const calendars = _.get(calListResp, "data.items")
      const calendarIds = calendars.map( item => item.id )
      this.db.set("calendarIds", calendarIds)
    },
    deactivate() {
      this.db.set("calendarIds", [])
    }
  },
  async run(event) {
    const previousCalendarIds = this.db.get('calendarIds') || []

    const calListResp = await this.googleCalendar.calendarList()
    const calendars = _.get(calListResp, "data.items")
    const currentCalendarIds = []

    for (const calendar of calendars) {
      currentCalendarIds.push(calendar.id)
      if (!previousCalendarIds.includes(calendar.id)) {
        this.$emit(calendar)
      }
    }
    this.db.set('calendarIds', currentCalendarIds)

  },
}
const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false
    });

    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function(target, property) {
        return customPage[property] || browser[property] || page[property]
      }
    })
  }


  constructor(page) {
    this.page = page;
  }

  async login() {
    // create a new user in the database and returns user object
    const user = await userFactory();

    // get user model as an argument and return session & sig
    const {
      session,
      sig
    } = sessionFactory(user);

    // set user cookie and fake sign in on automated browser.
    await this.page.setCookie({
      name: 'session',
      value: session
    });
    await this.page.setCookie({
      name: 'session.sig',
      value: sig
    })

    // refresh url for cookies updation
    await this.page.goto('localhost:3000/blogs');

    // wait for browserpage to loads up.
    await this.page.waitFor('a[href="/auth/logout"]');

  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }
}

module.exports = CustomPage
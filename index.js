const prompt = require("prompt");
const colors = require("@colors/colors");
const { existsSync } = require("node:fs");
const { createObjectCsvWriter } = require("csv-writer");

prompt.start();
prompt.message = "";
prompt.delimiter = "<>";

const check = existsSync("./contacts.csv");
const csv_writer = createObjectCsvWriter({
  path: "./contacts.csv",
  header: [
    {
      id: "name",
      title: "NAME",
    },
    {
      id: "email",
      title: "EMAIL",
    },
    {
      id: "phone",
      title: "PHONE-NUMBER",
    },
    {
      id: 'created_at',
      title:'CREATED_AT'
    }
  ],
  append: check === true,
});

class Person {
  constructor(name = "", phone = "", email = "") {
    this.name = name;
    this.email = email;
    this.phone = phone;
  }
  async saveDetailsToCsv() {
    const date = new Date().toISOString();
    try {
      await csv_writer.writeRecords([
        { name: this.name, phone: this.phone, email: this.email,created_at:date },
      ]);
      console.log(`${this.name}'s record have been successfully saved`);
    } catch (err) {
      console.log(err);
    }
  }
}

const questions = [
  {
    name: "name",
    description: colors.cyan("Contact Name"),
    required: true,

  },
  {
    name: "phone",
    description: colors.cyan("Contact Number"),
    required: true,
    pattern: /^\+?[1-9][0-9]{7,14}$/
  },
  {
    name: "email",
    description: colors.cyan("Contact Email"),
    required: true,
    pattern: /^\S+@\S+\.\S+$/
  },
];

const appGetDetails = async () => {
  let keepGoing = true;
  while (keepGoing) {
    try {
      const responses = await prompt.get(questions);
      const person = new Person(
        responses?.name,
        responses?.phone,
        responses?.email
      );
      await person.saveDetailsToCsv();
      const { again } = await prompt.get({
        properties: {
          again: {
            required: true,
            description: colors.yellow(
              "Do you want to add another contact? (y/n)"
            ),
            pattern: /^[ynYN]$/,
            message: "Please enter 'y' for yes or 'n' for no.",
          },
        },
      });
      keepGoing = again.toLowerCase() === "y";
    } catch (err) {
      if (err.message === "canceled") {
        console.log(colors.yellow("\nOperation cancelled by user."));
      }
      keepGoing = false;
    }
  }
  console.log(colors.rainbow("Application finished."));
};

appGetDetails();

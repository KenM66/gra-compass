const registrationsByTrip = {
  1: [
    {
      travelerNumber: 1047,
      firstName: "Robert",
      lastName: "Henderson",
      email: "robert@example.com",
      phone: "216-555-0142",
      dateOfBirth: "June 14, 1987",

      address: {
        street: "123 Main Street",
        city: "Cleveland",
        state: "OH",
        zipCode: "44113",
      },

      tsaPrecheck: true,
      passportNumber: "123456789",
      passportExpiration: "August 12, 2030",

      bringingGuest: true,

      guest: {
        firstName: "Amanda",
        lastName: "Henderson",
        email: "amanda@example.com",
      },

      emergencyContact: {
        name: "Robert Henderson",
        relationship: "Father",
        phone: "216-555-0198",
      },

      accessibility: "None",
      dietaryRequirements: "Vegetarian",

      activities: [
        {
          id: 1,
          type: "Excursion",
          name: "Catamaran & Snorkeling",
        },
        {
          id: 2,
          type: "Spa",
          name: "Swedish Massage",
        },
      ],
    },

    {
      travelerNumber: 1048,
      firstName: "Amanda",
      lastName: "Reynolds",
      email: "amanda@example.com",
      phone: "440-555-0185",
      dateOfBirth: "September 3, 1991",

      address: {
        street: "456 Lake Avenue",
        city: "Lakewood",
        state: "OH",
        zipCode: "44107",
      },

      tsaPrecheck: false,
      passportNumber: "987654321",
      passportExpiration: "May 20, 2029",

      bringingGuest: false,
      guest: null,

      emergencyContact: {
        name: "Susan Reynolds",
        relationship: "Mother",
        phone: "440-555-0150",
      },

      accessibility: "None",
      dietaryRequirements: "None",

      activities: [
        {
          id: 3,
          type: "Excursion",
          name: "Cancun City Tour",
        },
      ],
    },
  ],

  2: [
    {
      travelerNumber: 2051,
      firstName: "Robert",
      lastName: "Jenkins",
      email: "robert@example.com",
      phone: "907-555-0101",
      dateOfBirth: "January 9, 1984",

      address: {
        street: "789 Pine Street",
        city: "Anchorage",
        state: "AK",
        zipCode: "99501",
      },

      tsaPrecheck: true,
      passportNumber: "555666777",
      passportExpiration: "October 2, 2031",

      bringingGuest: false,
      guest: null,

      emergencyContact: {
        name: "Linda Jenkins",
        relationship: "Sister",
        phone: "907-555-0188",
      },

      accessibility: "None",
      dietaryRequirements: "None",

      activities: [],
    },
  ],
};
export default registrationsByTrip;

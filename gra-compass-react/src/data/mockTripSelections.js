const selectionsByTrip = {
  1: [
    {
      id: 1,
      type: "Excursion",
      name: "Catamaran & Snorkeling",
      sessions: [
        {
          id: 101,
          date: "2027-03-09",
          time: "10:00",
          maxCapacity: 25,

          active: true,
        },
        {
          id: 102,
          date: "2027-03-09",
          time: "14:00",
          maxCapacity: 25,

          active: true,
        },
      ],
    },

    {
      id: 2,
      type: "Excursion",
      name: "Island Jeep Tour",
      sessions: [
        {
          id: 201,
          date: "2027-03-10",
          time: "09:00",
          maxCapacity: 12,

          active: true,
        },
      ],
    },

    {
      id: 3,
      type: "Excursion",
      name: "Sunset Dinner Cruise",
      sessions: [
        {
          id: 301,
          date: "2027-03-11",
          time: "18:30",
          maxCapacity: 40,

          active: false,
        },
        {
          id: 302,
          date: "2027-03-12",
          time: "18:30",
          maxCapacity: 40,

          active: true,
        },
        {
          id: 303,
          date: "2027-03-13",
          time: "18:30",
          maxCapacity: 40,

          active: true,
        },
      ],
    },

    {
      id: 4,
      type: "Spa",
      name: "Massage Appointment",
      sessions: [
        {
          id: 401,
          date: "2027-03-10",
          time: "13:00",
          maxCapacity: 8,

          active: true,
        },
        {
          id: 402,
          date: "2027-03-10",
          time: "15:00",
          maxCapacity: 8,

          active: true,
        },
      ],
    },

    {
      id: 5,
      type: "Event",
      name: "Welcome Reception",
      sessions: [
        {
          id: 501,
          date: "2027-03-08",
          time: "19:00",
          maxCapacity: 100,

          active: true,
        },
      ],
    },
  ],
  2: [
    {
      id: 6,
      type: "Excursion",
      name: "Glacier Wildlife Cruise",
      sessions: [
        {
          id: 601,
          date: "2027-06-15",
          time: "09:00",
          maxCapacity: 30,
          active: true,
        },
        {
          id: 602,
          date: "2027-06-15",
          time: "13:00",
          maxCapacity: 30,
          active: true,
        },
      ],
    },
    {
      id: 7,
      type: "Excursion",
      name: "Alaskan Scenic Railway",
      sessions: [
        {
          id: 701,
          date: "2027-06-16",
          time: "08:30",
          maxCapacity: 40,
          active: true,
        },
        {
          id: 702,
          date: "2027-06-16",
          time: "13:30",
          maxCapacity: 40,
          active: true,
        },
      ],
    },
    {
      id: 8,
      type: "Excursion",
      name: "Denali Wilderness Tour",
      sessions: [
        {
          id: 801,
          date: "2027-06-17",
          time: "08:00",
          maxCapacity: 24,
          active: true,
        },
        {
          id: 802,
          date: "2027-06-17",
          time: "13:00",
          maxCapacity: 24,
          active: true,
        },
      ],
    },
    {
      id: 9,
      type: "Spa",
      name: "Spa Treatment",
      sessions: [
        {
          id: 901,
          date: "2027-06-16",
          time: "11:00",
          maxCapacity: 8,
          active: true,
        },
        {
          id: 902,
          date: "2027-06-16",
          time: "14:00",
          maxCapacity: 8,
          active: true,
        },
      ],
    },
    {
      id: 10,
      type: "Event",
      name: "Alaska Welcome Dinner",
      sessions: [
        {
          id: 1001,
          date: "2027-06-14",
          time: "18:30",
          maxCapacity: 100,
          active: true,
        },
      ],
    },
  ],
};

export default selectionsByTrip;

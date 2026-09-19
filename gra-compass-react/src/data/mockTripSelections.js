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
          registeredCount: 17,
          active: true,
        },
        {
          id: 102,
          date: "2027-03-09",
          time: "14:00",
          maxCapacity: 25,
          registeredCount: 20,
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
          registeredCount: 12,
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
          registeredCount: 28,
          active: false,
        },
        {
          id: 302,
          date: "2027-03-12",
          time: "18:30",
          maxCapacity: 40,
          registeredCount: 31,
          active: true,
        },
        {
          id: 303,
          date: "2027-03-13",
          time: "18:30",
          maxCapacity: 40,
          registeredCount: 0,
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
          registeredCount: 5,
          active: true,
        },
        {
          id: 402,
          date: "2027-03-10",
          time: "15:00",
          maxCapacity: 8,
          registeredCount: 8,
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
          registeredCount: 73,
          active: true,
        },
      ],
    },
  ],
};

export default selectionsByTrip;

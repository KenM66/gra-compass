const selectionsByTrip = {
  1: [
    {
      id: 1,
      type: "Excursion",
      name: "Catamaran & Snorkeling",
      maxCapacity: 50,
      registeredCount: 37,
      active: true,
      sessions: [
        {
          id: 101,
          date: "2026-06-14",
          time: "10:00",
          maxCapacity: 25,
          registeredCount: 17,
          active: true,
        },
        {
          id: 102,
          date: "2026-06-14",
          time: "14:00",
          maxCapacity: 25,
          registeredCount: 20,
          active: true,
        },
      ],
    },
    {
      id: 2,
      type: "Spa",
      name: "Swedish Massage",
      maxCapacity: 100,
      registeredCount: 93,
      active: false,
    },
  ],

  2: [
    {
      id: 3,
      type: "Excursion",
      name: "Glacier Cruise",
      maxCapacity: 200,
      registeredCount: 133,
      active: true,
    },
  ],
};

export default selectionsByTrip;

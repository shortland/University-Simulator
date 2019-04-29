export class InteractableTileMapping {
  sign_ids = [
    "sign-west",
    "sign-east",
    "sign-roth",
    "sign-javitz",
    "sign-new-cs",
    "sign-the-sac",
    "sign-humanities",
    "sign-rec-center",
    "sign-staller",
    "sign-wang",
    "sign-library",
    "sign-frey-hall",
    "sign-chemistry",
    "sign-physics",
    "sign-ess",
    "sign-engineering",
    "sign-light-engineering",
    "sign-heavy-engineering",
    "sign-harriman-hall",
    "sign-psychology"
  ];

  door_ids = [
    "door-west",
    "door-east",
    "door-roth",
    "door-javitz",
    "door-new-cs",
    "door-the-sac",
    "door-humanities",
    "door-rec-center",
    "door-staller",
    "door-wang",
    "door-library",
    "door-frey-hall",
    "door-chemistry",
    "door-physics",
    "door-ess",
    "door-engineering",
    "door-light-engineering",
    "door-heavy-engineering",
    "door-harriman-hall",
    "door-psychology"
  ];

  FOODS = {
    "food-pizza": {
      name: "Slice of Pepperoni Pizza",
      stats: {
        "hunger": 10,
        "cash": -5,
      }
    },
    "food-pizza-pepperoni": {
      name: "Slice of Pepperoni & Vegetable Pizza",
      stats: {
        "hunger": 12,
        "cash": -6,
      }
    },
    "food-rice-curry": {
      name: "Rice Curry",
      stats: {
        "hunger": 15,
        "cash": -10,
      }
    },
    "food-steak": {
      name: "Steak & Rice",
      stats: {
        "hunger": 20,
        "cash": -15,
      }
    },
    "food-cola": {
      name: "Coca-Cola",
      stats: {
        "cash": -4,
        "hunger": 1,
        "thirst": 20,
      }
    },
    "food-water": {
      name: "Smart Water",
      stats: {
        "cash": -3,
        "hunger": 1,
        "thirst": 10,
      }
    }
  };

  CARS = {
    "car-yellow": {
      name: "Luxury Yellow Car",
      speed: 600,
      scale: 3.0,
    },
    "car-blue": {
      name: "Affordable Yellow Car",
      speed: 450,
      scale: 3.0,
    },
    "car-red": {
      name: "Inexpensive Red Car",
      speed: 300,
      scale: 3.0,
    },
  };

  SKINS = {
    "Goku_Black": {
      name: "Goku Black",
      speed: 325
    },
    "Goku_Red": {
      name: "Goku Red",
      speed: 450
    }
  }
}

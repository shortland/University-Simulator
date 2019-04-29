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
    "Brown": {
      name: "Tan Shirt",
      speed: 200
    },
    "Goku_Black": {
      name: "Goku",
      speed: 400
    },
    "Goku_Red": {
      name: "Super Saiyan God Goku",
      speed: 600
    },
    "Black_Brown": {
      name: "Black Shirt",
      speed: 250
    },
    "Black": {
      name: "Black",
      speed: 250
    },
    "Blue_Clone": {
      name: "Teal 1",
      speed: 250
    },
    "Blue": {
      name: "Teal 2",
      speed: 250
    },
    "BrownV2": {
      name: "Tan 2",
      speed: 250
    },
    "Green_Brown": {
      name: "Green 1",
      speed: 250
    },
    "Green": {
      name: "Green 2",
      speed: 250
    },
    "Purple_Brown": {
      name: "Purple 1",
      speed: 250
    },
    "Purple": {
      name: "Purple 2",
      speed: 250
    },
    "Red_Brown": {
      name: "Red 1",
      speed: 250
    },
    "Red": {
      name: "Red 2",
      speed: 250
    },
    "car-yellow": {
      name: "Luxury Yellow Car",
      speed: 800
    },
    "car-blue": {
      name: "Affordable Blue Truck",
      speed: 600
    },
    "car-red": {
      name: "Cheap Red Car",
      speed: 400
    },
  };

  Id2Name(id) {
    return (this.SKINS[id] || this.CARS[id] || this.FOODS[id] || {name: id})["name"];
  };

  QOUTES = [
    "What's a SeaWolf?",
    "Try eating a different location on campus! I hear West is great!",
    "What's your favorite class?",
    "What's your major?",
    "Hi!",
    "I'm running late to class!!!",
    "Have you checked out SBU on reddit.com?",
    "Which major do you think is the hardest?",
    "Don't you love the summer!",
    "I can't wait for the summer!",
    "Geez... That midterm was really hard."
  ];
}

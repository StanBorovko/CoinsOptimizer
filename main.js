const input = [2, 7, 5, 8, 9, 10, 6, 5, 4, 3];

const testDrivers = [
    [10, 2, 6, 5, 7, 8, 1, 3, 4, 9],
    [8, 4, 2, 9, 10, 3, 1, 7, 6, 5],
    [6, 2, 8, 7, 5, 10, 3, 9, 1, 4],
    [3, 8, 4, 1, 6, 10, 2, 5, 9, 7],
    [1, 3, 7, 9, 4, 6, 10, 5, 8, 2],
    [9, 4, 2, 7, 3, 1, 5, 10, 8, 6],
    [6, 5, 3, 1, 2, 4, 10, 8, 7, 9],
    [3, 7, 10, 4, 5, 8, 9, 2, 1, 6],
    [1, 4, 7, 9, 6, 2, 3, 10, 5, 8],
    [8, 3, 2, 9, 4, 7, 10, 1, 5, 6]
];


class App {
    constructor({
                    costs,
                    driversNumber = 10, //Number of random creating drivers (min 8)
                    maxCounter = 100, //Maximum number of steps, algorithm is stopping after achieving max steps number
                    survivePercent = 0.5, //Percent of non-dropped drivers (max 1, min 0.1)
                    mutation = false, //true if need mutation, false in other case
                    mutationPercent = 0.3, //Percent of mutated drivers (max 1, min 0.1)
                    mutationRate = 0.2, //Percent of mutated coins of every mutated driver (max 1, min 0.1)
                    testMode = false //If true - array "drivers" will be one every time.
                }) {
        this.costs = costs;
        this.coins = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        this.driversNumber = driversNumber;
        this.maxCounter = maxCounter;
        this.surviveNumber = Math.round(this.driversNumber * survivePercent);
        this.mutation = mutation;
        this.mutantsNumber = Math.round(this.driversNumber * mutationPercent);
        this.mutationRate = Math.round(this.coins.length * mutationRate);

        this.testMode = testMode;
        this.testDrivers = [
            [10, 2, 6, 5, 7, 8, 1, 3, 4, 9],
            [8, 4, 2, 9, 10, 3, 1, 7, 6, 5],
            [6, 2, 8, 7, 5, 10, 3, 9, 1, 4],
            [3, 8, 4, 1, 6, 10, 2, 5, 9, 7],
            [1, 3, 7, 9, 4, 6, 10, 5, 8, 2],
            [9, 4, 2, 7, 3, 1, 5, 10, 8, 6],
            [6, 5, 3, 1, 2, 4, 10, 8, 7, 9],
            [3, 7, 10, 4, 5, 8, 9, 2, 1, 6],
            [1, 4, 7, 9, 6, 2, 3, 10, 5, 8],
            [8, 3, 2, 9, 4, 7, 10, 1, 5, 6]
        ];
    }

    static random10() {
        return Math.floor(Math.random() * 11);
    }

    static randomN(N) {
        return Math.floor(Math.random() * (N + 1));
    }

    static compareDrivers(driver1, driver2) {
        const coins1 = driver1.length,
            coins2 = driver2.length;
        if (coins1 !== coins2) {
            return false;
        } else {
            for (let i = 0; i < coins1; i++) {
                if (driver1[i] !== driver2[i]) {
                    return false
                }
            }
        }
        return true;
    }

    static validate(driver) {
        let coinsNumber = driver.length;
        for (let i = 0; i < coinsNumber - 1; i++) {
            for (let j = i + 1; j < coinsNumber; j++) {
                if (driver[i] === driver[j]) {
                    return false
                }
            }
        }
        return true;
    }

    static compareAllDrivers(drivers1, drivers2) {
        const driversNumber1 = drivers1.length,
            driversNumber2 = drivers2.length;
        if (driversNumber1 !== driversNumber2) {
            return false
        } else {
            for (let i = 0; i < driversNumber1; i++) {
                if (!App.compareDrivers(drivers1[i], drivers2[i])) {
                    return false;
                }
            }
        }
        return true;
    }

    getRandomDrivers(driversNumber) {
        let drivers = [];
        for (let i = 0; i < driversNumber; i++) {
            drivers[i] = [];
            let coins = [...this.coins], coinsNumber = coins.length;
            while (coinsNumber--) {
                let randomIndex = App.randomN(coinsNumber);
                // console.log('randInd:', randomIndex, 'coin:', coins[randomIndex], 'coins:', coins);
                drivers[i].push(coins[randomIndex]);
                coins = [
                    ...coins.slice(0, randomIndex),
                    ...coins.slice(randomIndex + 1)
                ];
            }
        }
        return drivers;
    }

    calcDebt(driver) {
        return driver.reduce((accumulator, coin, i) => {
            let delta = this.costs[i] - coin,
                debt = (delta > 0) ? delta : 0;
            return accumulator + debt;
        });
    }

    getDebts(drivers) {
        return drivers.map(driver => {
            return {driver: drivers.indexOf(driver), debt: this.calcDebt(driver)};
        });
    }

    killWorstDrivers(drivers, debts) {
        let sortedDebts = [...debts].sort((a, b) => {
                return a.debt - b.debt
            }),
            survivedDrivers = [];
        // console.log(sortedDebts);
        for (let i = 0; i < this.surviveNumber; i++) {
            let survivedIndex = sortedDebts[i].driver;
            survivedDrivers.push(drivers[survivedIndex]);
        }
        return survivedDrivers;
    }

    crossbreed(breed1, breed2, index) {
        const newBreed = [
            ...breed1.slice(0, index),
            ...breed2.slice(index)
        ];
        // console.log('breed1:', App.validate(breed1), '\nbreed2:', App.validate(breed2), '\nnew_breed:', App.validate(newBreed));
        // console.log('result:', (App.validate(newBreed)) ? 'newBreed' : 'breed1');
        return (App.validate(newBreed)) ? newBreed : breed1;
    }

    crossbreed50to50(breed1, breed2) {
        return this.crossbreed(breed1, breed2, 5);
    }

    crossbreedRandom(breed1, breed2) {
        const randomIndex = App.randomN(breed1.length - 1);
        return  this.crossbreed(breed1, breed2, randomIndex);
    }

    crossbreedDrivers(drivers) {
        const initialNumber = drivers.length,
            newDrivers = [];
        let j = 0;
        for (let i = initialNumber; i < this.driversNumber; i++) {
            let current = drivers[j],
                next = ((j + 1) < initialNumber) ? drivers[j + 1] : drivers[0],
            newDriver = this.crossbreedRandom(current, next);
            if (App.validate(newDriver)) {
                newDrivers.push(newDriver);
            } else {
                newDrivers.push(current);
            }
            if ((j + 1) < initialNumber) j++;
            else j = 0;
        }
        // console.log('newDrivers', newDrivers, '\ndrivers', drivers);
        return [...newDrivers, ...drivers];
    }

    mutateDriver(driver) {
        let driverCopy = [...driver];
        for (let i = 0; i < this.mutationRate; i++) {
            let coinsNumber = driver.length,
                randomIndex1 = App.randomN(coinsNumber - 1),
                randomIndex2 = App.randomN(coinsNumber - 1);
            while (randomIndex1 === randomIndex2) {
                randomIndex2 = App.randomN(coinsNumber - 1);
            }
            let randomCoin = driverCopy[randomIndex1];
            driverCopy[randomIndex1] = driver[randomIndex2];
            driverCopy[randomIndex2] = randomCoin;
        }
        return driverCopy;
    }

    mutateAllDrivers(drivers) {
        let driversCopy = [...drivers];
        for (let i = 0; i < this.mutantsNumber; i++) {
            let driversNumber = drivers.length,
                randomIndex = App.randomN(driversNumber - 1);
            do {
                driversCopy[randomIndex] = this.mutateDriver(drivers[randomIndex]);
            }
            while (!App.validate(driversCopy[randomIndex])) ;
        }
        return driversCopy;
    }


    run() {
        // let drivers = this.getRandomDrivers(this.driversNumber);
        // console.log('drivers:', drivers);
        let drivers = (this.testMode) ? this.testDrivers : this.getRandomDrivers(this.driversNumber);
        let debts = this.getDebts(drivers);
        // console.log('debts:', debts);
        let survivedDrivers = this.killWorstDrivers(drivers, debts);
        /*console.log('surviving',survivedDrivers.map(driver => {
            return App.validate(driver)
        }));*/
        // console.log('survivedDrivers:', survivedDrivers);
        let newDrivers = null,
            newDebts = null,
            newSurvivedDrivers = null,
            counter = 0;
        do {
            let crossbreeded = this.crossbreedDrivers(survivedDrivers);
            /*console.log('crossbreeding',crossbreeded.map(driver => {
                return App.validate(driver)
            }));
*/
            newDrivers = (this.mutation) ? this.mutateAllDrivers(crossbreeded) : crossbreeded;
            /*console.log('mutating:',newDrivers.map(driver => {
                return App.validate(driver);
            }));*/
            // console.log('newDrivers:', newDrivers);
            newDebts = this.getDebts(newDrivers);
            newSurvivedDrivers = this.killWorstDrivers(newDrivers, newDebts);
            if (App.compareAllDrivers(survivedDrivers, newSurvivedDrivers) || counter >= this.maxCounter) {
                break;
            } else {
                survivedDrivers = newSurvivedDrivers;
                counter++;
            }
        }
        while (true);
        // console.log(newDrivers);

        return {bestDriver: newSurvivedDrivers[0], bestDebt: newDebts[0].debt, counter}
    }
}

const app = new App({
    costs: input,
    maxCounter: 1000
});
const app2 = new App({
    costs: input,
    mutation: true,
    maxCounter: 1000
});
for (let i = 0; i < 10; i++) {
    console.log('with mutation:',app.run());
    console.log('without mutation:',app2.run());
}

// console.log(app.mutateDriver([8, 3, 2, 9, 4, 7, 10, 1, 5, 6]));
/*
console.log(testDrivers.map(driver => {
    return App.validate(driver)
}));*/

const input = [2, 7, 5, 8, 9, 10, 6, 5, 4, 3];

const testDrivers =  [
    [ 10, 2, 6, 5, 7, 8, 1, 3, 4, 9 ],
    [ 8, 4, 2, 9, 10, 3, 1, 7, 6, 5 ],
    [ 6, 2, 8, 7, 5, 10, 3, 9, 1, 4 ],
    [ 3, 8, 4, 1, 6, 10, 2, 5, 9, 7 ],
    [ 1, 3, 7, 9, 4, 6, 10, 5, 8, 2 ],
    [ 9, 4, 2, 7, 3, 1, 5, 10, 8, 6 ],
    [ 6, 5, 3, 1, 2, 4, 10, 8, 7, 9 ],
    [ 3, 7, 10, 4, 5, 8, 9, 2, 1, 6 ],
    [ 1, 4, 7, 9, 6, 2, 3, 10, 5, 8 ],
    [ 8, 3, 2, 9, 4, 7, 10, 1, 5, 6 ]
];



class App {
    constructor({costs, driversNumber = 10, maxCounter = 1000}) {
        this.costs = costs;
        this.coins = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        this.driversNumber = driversNumber;
        this.maxCounter = maxCounter;
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
        for (let i = 0; i < 4; i++) {
            let survivedIndex = sortedDebts[i].driver;
            survivedDrivers.push(drivers[survivedIndex]);
        }
        return survivedDrivers;
    }

    crossbreed50to50(breed1, breed2) {
        return [
            ...breed1.slice(0, 5),
            ...breed2.slice(5)
        ];
    }

    crossbreedRandom(breed1, breed2) {
        const randomIndex = App.randomN(breed1.length - 1);
        return [
            ...breed1.slice(0, randomIndex),
            ...breed2.slice(randomIndex)
        ];
    }

    crossbreedDrivers(drivers) {
        const initialNumber = drivers.length,
            newDrivers = [];
        let j = 0;
        for (let i = initialNumber; i < this.driversNumber; i++) {
            let current = drivers[j],
                next = ((j + 1) < initialNumber) ? drivers[j + 1] : drivers[0];
            newDrivers.push(this.crossbreedRandom(current, next));
            if ((j + 1) < initialNumber) j++;
            else j = 0;
        }
        return [...newDrivers, ...drivers];
    }


    run() {
        // let drivers = this.getRandomDrivers(this.driversNumber);
        // console.log('drivers:', drivers);
        let drivers = testDrivers;
        let debts = this.getDebts(drivers);
        // console.log('debts:', debts);
        let survivedDrivers = this.killWorstDrivers(drivers, debts);
        // console.log('survivedDrivers:', survivedDrivers);
        let newDrivers = null,
            newDebts = null,
            newSurvivedDrivers = null,
            counter = 0;
        do {
            newDrivers = this.crossbreedDrivers(survivedDrivers);
            console.log('newDrivers:', newDrivers);
            newDebts = this.getDebts(newDrivers);
            newSurvivedDrivers = this.killWorstDrivers(newDrivers, newDebts);
            if (App.compareAllDrivers(survivedDrivers, newSurvivedDrivers) /*|| counter >= this.maxCounter*/) {
                break;
            } else {
                survivedDrivers = newSurvivedDrivers;
                counter++;
            }
        }
        while (true);
        console.log(newDrivers);
        return {bestDriver: newSurvivedDrivers[0], counter}
    }
}

const app = new App({
    costs: input,
    maxCounter: 6
});
console.log(app.run());

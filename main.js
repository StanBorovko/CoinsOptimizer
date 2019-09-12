input = [2, 7, 5, 8, 9, 10, 6, 5, 4, 3];


class App {
    constructor(costs, driversNumber = 10) {
        this.costs = costs;
        this.coins = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        this.driversNumber = driversNumber;
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

    crossbreedDrivers(drivers) {
        const initialNumber = drivers.length,
            newDrivers = [];
        let j = 0;
        for (let i = initialNumber; i < this.driversNumber; i++) {
            let current = drivers[j],
                next = ((j + 1) < initialNumber) ? drivers[j + 1] : drivers[0];
            newDrivers.push(this.crossbreed50to50(current, next));
            if ((j + 1) < initialNumber) j++;
            else j = 0;
        }
        return newDrivers;
    }


    run() {
        let drivers = this.getRandomDrivers(this.driversNumber);
        // console.log('drivers:', drivers);
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
            // console.log('newDrivers:', newDrivers);
            newDebts = this.getDebts(newDrivers);
            newSurvivedDrivers = this.killWorstDrivers(newDrivers, newDebts);
            if (App.compareDrivers(survivedDrivers, newSurvivedDrivers) || counter >= 1000000) {
                break;
            } else {
                survivedDrivers = newSurvivedDrivers;
                counter++;
            }
        }
        while (true);
        return {bestDriver: newSurvivedDrivers[0], counter}


    }

}

const app = new App(input, 100);
console.log(app.run());
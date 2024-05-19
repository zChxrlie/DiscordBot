import { strikes, reasons } from './bot';
import * as fs from 'fs';

export const utils = {
    saveStrikes() {
        this.orderStrikes();

        let saveString = "";
        strikes.forEach((personStrikes) => {
            saveString += personStrikes[0] + ";" + personStrikes[1] + ",";
        });
        fs.writeFile('src/strikes.txt', saveString.slice(0, -1), function(err) {
            if(err) return console.log("Saving strike file error",err);
            console.log("Strike file was saved!");
        });
    },

    saveReasons() {
        let saveString = "";
        reasons.forEach((personReasons) => {
            saveString += personReasons[0] + ";" + personReasons[1] + ",";
        });
        fs.writeFile('src/reasons.txt', saveString.slice(0, -1), function(err) {
            if(err) return console.log("Saving reason file error",err);
            console.log("Reason file was saved!");
        });
    },

    orderStrikes() {
        strikes.sort(function(a, b) { return b[1] - a[1]});            
    }
}
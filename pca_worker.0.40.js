        
       
        // worker.js
        self.onmessage = function(event) {
            const { parsedData, elapsedTimeInSeconds, start, stop, normalizedKPI1Values, b, i, st, modeCPI1, modeCPI1b } = event.data;
            const result = coreCalcStats(parsedData, elapsedTimeInSeconds, start, stop, normalizedKPI1Values, b, i, st, modeCPI1, modeCPI1b);
            postMessage(result);
        };  

        function coreCalcStats(parsedData, elapsedTimeInSeconds, start, stop, normalizedKPI1Values, b, i, st, modeCPI1, modeCPI1b) {
            let notcounted = 0;
            let counted = 0;
            let resultarr = [];
            stop = stop +1;
            let longheader = [];
            let header = [];
            const normalizedKPI1Values_sum = normalizedKPI1Values.reduce((sum, value) => sum + value, 0);
            const normalizedKPI1Values_avg = normalizedKPI1Values_sum / normalizedKPI1Values.length;
            //console.log(Date.now(), ` worker`, i, ` batch`, b, ` coreCalcStats: starting new batch column=`, start, `, to ,`, stop);

            

            const modeCPI1q = Math.floor(modeCPI1 + (modeCPI1b - modeCPI1)/4); //get the samples immediately after CP1, and then up to 1/4 of the load duration.
            //console.log(Date.now(), ` coreCalcStats: worker`, i, ` batch`, b, `------modeCPI1q=`, modeCPI1q);
            //for (let c = start; c < stop -1; c++) { 
            //console.log(Date.now(), ` coreCalcStats: worker`, i, ` batch`, b, `------parsedData=`, parsedData);
            for (let c = start; c <= stop -1; c++) { 
                try {
                    //console.log(Date.now(), ` coreCalcStats: worker`, i, ` batch`, b, `cleaning------parsedData=`, parsedData);
                    let rowValues;
                    if (stop <= 2) {  // fix for single column files, like ECG
                        console.log(Date.now(), ` coreCalcStats: worker`, i, ` batch`, b, `single column file found`);
                        //rowValues = parsedData.map((row) => parseFloat(row[c].replace(/"/g, '')));
                        //rowValues = Object.values(parsedData).map((row) => parseFloat(row[0]));
                        rowValues = Object.values(parsedData).slice(1).map(row => parseFloat(row[0])); //skip header
                        longheader = parsedData[0][0];  // row zero, column c is counter name 
                        header = shortenCounterName(longheader);
                        //console.log(Date.now(), ` worker`, i, ` batch`, b, `------longHeader=`,longheader,`header=`, header);
                    } else {
                        rowValues = parsedData.slice(2).map((row) => parseFloat(row[c].replace(/"/g, '')));
                        longheader = parsedData[0][c];  // row zero, column c is counter name 
                        header = shortenCounterName(longheader);
                        //console.log(Date.now(), ` worker`, i, ` batch`, b, `------longHeader=`,longheader,`header=`, header);
                    }
                    
                    //console.log(Date.now(), ` coreCalcStats: worker`, i, ` batch`, b, `c=`, c, `------rowValues=`, rowValues);

                    const rVl = rowValues.length;
                    const preLoadValues = rowValues.filter((value, index) => index < modeCPI1);
                    const ImmdLoadValues = rowValues.filter((value, index) => index >= modeCPI1 && index <= modeCPI1q);
                    const midLoadValues = rowValues.filter((value, index) => index >= modeCPI1 && index <= modeCPI1b);
                    const postLoadValues = rowValues.filter((value, index) => index > modeCPI1b);
                    //console.log(Date.now(), ` coreCalcStats: modeCPI1=`,modeCPI1,`modeCPI1b=`,modeCPI1b,`preLoadValues.length=`, preLoadValues,`midLoadValues.length=`, midLoadValues,`postLoadValues.length=`, postLoadValues );
                    

                    let maxValue = Math.max(...rowValues).toFixed(3); 
                    //console.log(Date.now(), ` coreCalcStats: worker`, i, ` batch`, b, `c=`, c, `------maxValue=`, maxValue);

                    let loadmaxValue = Math.max(...midLoadValues).toFixed(3); 
                        if (loadmaxValue >= 10) { loadmaxValue = Math.floor(loadmaxValue);}
                    let minValue = Math.min(...postLoadValues).toFixed(3); 
                    let postminValue = Math.min(...postLoadValues).toFixed(3); 
                        if (postminValue >= 10) { postminValue = Math.floor(postminValue);}
                    const range = maxValue - minValue; 
                    if (maxValue > 0 && maxValue != 'undefined' && range > 0) { //Bypass stats if all zeros or flat line

                        //const longheader = parsedData[0][c];  // row zero, column c is counter name 
                        //const header = shortenCounterName(longheader);
                        //console.log(Date.now(), ` worker`, i, ` batch`, b, `------longHeader=`,longheader,`header=`, header);

                        const sumValue = preLoadValues.reduce((sum, value) => sum + value, 0) ; 
                        let baseAvgValue = (sumValue / preLoadValues.length).toFixed(3); 
                        if (baseAvgValue >= 10) { baseAvgValue = Math.floor(baseAvgValue);}

                        //const sortedValues = [...midLoadValues].sort((a, b) => a - b);  //sort first needed for median
                        const sortedValues = [...ImmdLoadValues].sort((a, b) => a - b);  //sort first needed for median
                        //console.log(Date.now(), `coreCalcStats: sortedValues=`,sortedValues );

                        let ImmedMedianValue = (sortedValues[Math.floor(sortedValues.length / 2)]).toFixed(3);
                        if (ImmedMedianValue >= 10) { ImmedMedianValue = Math.floor(ImmedMedianValue);}
                        //console.log(`coreCalcStats: medianValue=`,medianValue,`modeCPI1q=`,modeCPI1q );

                        //const intervalSlope = parseFloat(getintervalSlope(rowValues));
                        //const upCounter = calculateUpCounterFloat(rowValues);
                        //const peakInt = getpeakInt(rowValues, maxValue);

                        const [changepointIndex1, changepointIndex2]  = getchangepointIndex(rowValues);

                        const growthIndex = calculateAggressiveGrowthIndexFL(rowValues, maxValue); 
                        let KPI1similarity = 0;
                        const norm_rowValues = normalize(rowValues);
                        const NormsumValue = norm_rowValues.reduce((sum, value) => sum + value, 0) ; 
                        //console.log(`CalculateStats/KPI1similarity NormsumValue=`, NormsumValue);
                        const NormavgValue = NormsumValue / norm_rowValues.length;
                        //console.log(`CalculateStats/KPI1similarity NormavgValue=`, NormavgValue);
                        try {
                            if (normalizedKPI1Values.length >0){
                                KPI1similarity = euclideanDistance(normalizedKPI1Values, normalizedKPI1Values_avg, norm_rowValues, NormavgValue);
                                //console.log(`coreCalcStats: KPI1similarity=`,KPI1similarity, ` normKPI1Values=`, normalizedKPI1Values); 
                            } 
                            //console.log(`Similarity: ${similarity}`);
                        } catch (error) {
                            console.log(Date.now(), ` coreCalcStats: worker`, i, ` batch`, b, ` --------!!!!!---- KPI1similarity failed`, error);
                        }        
                        rowdata = {
                            "Countername": header,
                            "baseAvgValue": baseAvgValue,
                            "ImmedMedianValue": ImmedMedianValue,
                            "loadmaxValue": loadmaxValue,
                            "postminValue": postminValue,
                            //"intervalSlope": intervalSlope,
                            //"upCounter": upCounter,
                            //"peakInt": peakInt,
                            "changepointIndex1": changepointIndex1,
                            "changepointIndex2": changepointIndex2,
                            "growthIndex": growthIndex,
                            "KPI1similarity" : KPI1similarity,
                            //"rowNum": counted + 1,
                        };                
                        resultarr.push(rowdata); 
                        counted++;
                        //if (c % 100 === 0) {console.log(`worker `, i, ` batch `, b, ` coreCalcStats: Countername=`, header) };
                        //if (c > 0) {console.log(`worker `, i, ` batch `, b, ` coreCalcStats: Countername=`, header) };
                    } else {
                        notcounted += 1;
                       //try {
                           //console.log(Date.now(), ` worker`, i, ` batch`, b, ` not counting this counter=`,notcounted );
                       //} catch {}
                    }
                } catch (error){
                    // safe to ignore. Normal to overrun the count since we are skipping zero counters
                    //console.log(Date.now(), ` coreCalcStats: worker`, i, ` batch`, b, `c=`,c, `stop=`, stop, `error =`, error);
                    break;  // exit the loop
                }
            }  
            //const now = Date.now();
            //console.log(now, ` worker `,i, ` batch ${b} coreCalcStats: duration=${now-st} column= ${start} to ${stop} resultarr.length= ${resultarr.length} notcounted= ${notcounted}`);
            return [resultarr, notcounted, st];    
        }



        //Find the interval with the biggest change to slope   (there is a copy of this in core_functions, but workers need to be standalone)
        function getchangepointIndex(Values) {
            let largestChange = .01;  //set a min bar above zero
            let diffValue = [];
            const vl = Values.length;
            let largestGrowthInterval = vl;
            let LargestDeclineInterval = vl;
            //console.log(Date.now(), `getchangepointIndex: from preProcess, Values=`, Values);
            //loop through all the values to get the biggest increasing change
            for (let i = 3; i < vl; i++) {
                const earlySample = (parseFloat(Values[i - 1]) + parseFloat(Values[i - 2]));
                //console.log(`getchangepointIndex: from preProcess, i=${i} earlySample=`, earlySample);
                const lateSample = (parseFloat(Values[i]) + parseFloat(Values[i+1]));
                diffValue = (parseFloat(lateSample - earlySample)); //positive only
                if (diffValue > largestChange) {
                    largestChange = diffValue;
                    largestGrowthInterval = i; // Store the sample interval with the largest change 
                }
            }
            largestChange = .01; // reset
            // loop again to get biggest decreasing changes
            for (let i = 3; i < Values.length; i++) {
                const earlySample = (parseFloat(Values[i - 1]) + parseFloat(Values[i - 2]));
                const lateSample = (parseFloat(Values[i]) + parseFloat(Values[i+1]));
                diffValue = (parseFloat(earlySample- lateSample)); //negative only
                if (diffValue > largestChange ) {
                    largestChange = diffValue;
                    LargestDeclineInterval = i; // Store the sample interval with the largest change  
                }
            }
            return [largestGrowthInterval,LargestDeclineInterval] ;
        }




/*         function shortenCounterNameold7(longHeader) { //only the device name/
            // Regular expression to match and extract the counter name after the first singular slash
            const regex = /\\([^\\]+)/;
            // Apply the regex and extract the shortened counter name
            const match = regex.exec(longHeader);
            if (match && match.length > 1) {
                return match[1];
            } else {
                return longHeader; // Return the original string if no match is found
            }
        }

        } */

        function shortenCounterName(longHeader) { 
            // Regular expression to match and extract the counter name after the device name
            const regex = /\\[^\\]+\\(.+)/;
            // Apply the regex and extract the shortened counter name
            const match = regex.exec(longHeader);

            if (match && match.length > 1) {
                const withoutZeros = match[1].replace(/0x00000000/g, ''); //remove leading zeros
                return withoutZeros;
            } else {
                return longHeader.replace(/0x00000000/g, ''); // Return the original string if no match is found
            }
        }
        

        
        
        
        
        
        


        function euclideanDistance(series1, series1_avg, series2, series2_avg) {
            if (series1.length !== series2.length) {
                throw new Error(`euclideanDistance: Time series lengths do not match series1.length=${series1.length} series2.length=${series2.length}`);
            }
            let sumOfSquaredDifferences = 0;
            for (let i = 1; i < series1.length; i++) {
                const difference1 = Math.abs(series1[i] - series1_avg);
                const difference2 = Math.abs(series2[i] - series2_avg);
                const squaredDifference = (difference1 - difference2) * (difference1 - difference2);
                sumOfSquaredDifferences += squaredDifference;
                //console.log(`euclideanDistance: difference1=${difference1} difference2)=${difference2}`);
            }
            const euclideanDistance = 1 / (1 + Math.sqrt(sumOfSquaredDifferences));
            //console.log(`euclideanDistance: sumOfSquaredDifferences=${sumOfSquaredDifferences} euclideanDistance=${euclideanDistance}`);
            return euclideanDistance.toFixed(3); // Similarity score (closer to 1 is more similar)
        }


         // Get the slope between the first set of samples and the last
         function getintervalSlope(Values) {
            let intervalSlope = 0;
            let sumbeginBaseline = 0;
            let sumendingBaseline = 0;
            try {
                // Calculate the number of samples for the first and last 25%
                const numSamples = Values.length;
                const beginBaseline = Math.floor(numSamples * 0.15); // from zero to beginBaseline
                const endingBaseline = Math.floor(numSamples * 0.85); // from endingBaseline to end of samples
                //console.log(`beginBaseline=`,beginBaseline, `endingBaseline=`,endingBaseline);
                for (let i = 0; i < beginBaseline; i++) {
                    sumbeginBaseline += Values[i];
                }
                for (let i = endingBaseline; i < numSamples; i++) {
                    sumendingBaseline += Values[i];
                }
                //console.log(`IntervalSlope: sumbeginBaseline=${sumbeginBaseline} sumendingBaseline=${sumendingBaseline}`);
                if (sumbeginBaseline> 0 && sumendingBaseline> 0 && sumbeginBaseline>sumendingBaseline) {
                    intervalSlope = parseFloat(sumbeginBaseline/sumendingBaseline);
                    if (intervalSlope > 100) {intervalSlope = 0;}
                    intervalSlope = intervalSlope*-1;
                    //console.log(`IntervalSlope: intervalSlope=${intervalSlope}`);
                }
                if (sumbeginBaseline> 0 && sumendingBaseline> 0 && sumbeginBaseline<sumendingBaseline) {
                    intervalSlope = parseFloat(sumendingBaseline/sumbeginBaseline);
                    if (intervalSlope > 100) {intervalSlope = 0;}
                    //console.log(`IntervalSlope: intervalSlope=${intervalSlope}`);
                }
            } catch (error) {
                console.log(`IntervalSlope: error`, error);
            }
            return intervalSlope.toFixed(4);
        }

        function calculateUpCounterFloat(counterData) {
            let upCounter = 0;
            let cL = counterData.length;
            for (let i = 3; i < cL; i++) {
                if (parseFloat(counterData[i]) > parseFloat(counterData[i - 1])) {(upCounter += cL-i);}
                if (parseFloat(counterData[i]) < parseFloat(counterData[i - 1])) {(upCounter -= cL-i);} 
            }
            upCounter = Math.round(upCounter/(cL), 1);
            return upCounter;
        }


        function getpeakInt(rowValues, maxValue) {
            //When is the first Interval value = maxValue
            let peakInterval = rowValues.length;
            for (let i = 1; i < rowValues.length -1; i++) {
                if (rowValues[i] == maxValue) {
                    if (rowValues[i-1] != maxValue || rowValues[i+1] != maxValue ) {
                        peakInterval = i;
                        return peakInterval;;
                    }
                }
            }
            //console.log(`getpeakInt: rowvalues.length=`, rowValues.length, ` maxValue=`, maxValue, `peakInterval=`, peakInterval);
            return peakInterval;
        }

     

        
        function calculateAggressiveGrowthIndexFL(samplePointsSet, maxValue) {
            let results = 0;
            const sPSl = samplePointsSet.length;
            //console.log(`FL samplePointlength lenght= ${samplePointsSet.length} maxValue ${maxValue}`);
            if (samplePointsSet && samplePointsSet.length > 0 && maxValue > 0 ) {
                //console.log(`FL sampleSet and samplePointlength FL >0`);
                for (let i = 1; i < sPSl ; ++i) {
                    results += (percentageValue(samplePointsSet[i], maxValue) - percentageValue(samplePointsSet[i - 1], maxValue)) * (sPSl - i);
                    //console.log(`FL percent i= ${i} value ${samplePointsSet[i]} and percentage value ${percentageValue(samplePointsSet[i].percentageValue, maxValue)}` );
                }
                results = (results / (sPSl * 100)).toFixed(3);
            }
            return parseFloat(results);
        }


        // map the actual values to the same scale of zero to one
        function normalize(values) {    
            //console.log(`normalize: These are Floats`, values);
            try {values = values.map((value) => Number(value.replace(/"/g, '')));} catch (error) {}  
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            const range = maxValue - minValue;
            //console.log(`normalize: minValue ${minValue} maxValue ${maxValue} range ${range}`);
            if (range === 0) { // Check if range is zero
                return Array(values.length).fill(0); //eturn an array of zeros, same length as values
            } else {
                return values.map((value) => parseFloat(((value - minValue) / range).toFixed(3))); //normailze
            }
        }

        function percentageValue(point, maxValue) {
            // Calculate the point as a percentage of the maxValue
            //console.log(`percentageValue point is ${point}, maxValue is ${maxValue}`);
            try {
                let value = Math.round((parseFloat(point) / parseFloat(maxValue)) *100);
                //console.log(`percentageValue calculated is ${value}`);
                return value;
            } catch (error) {
                console.log(`percentageValue: calculated ZERO, error msg: ${error}`);
                return 0;
            }
        }


        

       
        

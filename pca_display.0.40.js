
function setChartScrollListener() {
    // Attach event listener to chart canvas
    const canvas = document.getElementById("chartCanvas");
    canvas.addEventListener('wheel', handleChartScroll);
    console.log(Date.now(), `setChartScroll: setting scroll listener, canvas=`, canvas);    
}


// Define function to handle scroll events
async function handleChartScroll(event) {
    console.log(Date.now(), `handleChartScroll: event=`, event);
    // Get the position of the mouse click relative to the chart canvas
    const canvas = document.getElementById("chartCanvas");
    const rect = canvas.getBoundingClientRect();
    //console.log(Date.now(), `handleChartScroll: rect=`, rect);
    const mouseX = event.clientX - rect.left;
    console.log(Date.now(), `handleChartScroll: mouseX=`, mouseX);

    // Calculate the new time range based on the direction of the scroll and the mouse position
    const timePerPixel = (maxLines - 0) / 1000;

    const zoomCenter = Math.floor(((mouseX/1000))*maxLines);
    console.log(Date.now(), `handleChartScroll: zoomCenter=`, zoomCenter);

    // Determine the direction of the scroll
    const deltaY = event.deltaY;
    console.log(Date.now(), `handleChartScroll: deltaY=`, deltaY);
    //const zoomFactor = deltaY > 0 ? 0.9 : 1.1; // Adjust zoom factor as needed
    const zoomFactor = deltaY > 0 ? 1 : -1; // Adjust zoom factor as needed
    console.log(Date.now(), `handleChartScroll: zoomFactor=`, zoomFactor, `timePerPixel=`, timePerPixel);

    xAxis = chart.scales.x;
    oldMin = xAxis.options.min;
    oldMax = xAxis.options.max;

    let newMin = [];
    let newMax = [];

    const step = ((maxLines*.02) * zoomFactor);

    if (mouseX < 250) { //'scroll left'
        console.log(Date.now(), `handleChartScroll: Scrolling left` );
        newMin = oldMin - step;
        newMax = oldMax - step;
        if (newMin <= 1) {
            newMin = 1;
            newMax = oldMax; // stop scrolling left
        }
        if (newMax >= maxLines) {
            newMax = maxLines;
            newMin = oldMin; // stop scrolling right
        }  
    }
    if (mouseX > 250 && mouseX < 750) { //'zoom by zoomfactor'
        console.log(Date.now(), `handleChartScroll: Zooming` );
        newMin = oldMin + step;
        newMax = oldMax - step;
        if (newMax <= newMin) {newMax = oldMax;}
        if (newMin >= newMax) {newMin = oldMin;}
    }
    if (mouseX > 550) { //'scroll right'
        console.log(Date.now(), `handleChartScroll: Scrolling Right` );
        newMin = oldMin + step;
        newMax = oldMax + step;
        if (newMax >= maxLines) {
            newMax = maxLines;
            newMin = oldMin; // stop scrolling right
        }
        if (newMin <= 1) {
            newMin = 1;
            newMax = oldMax; // stop scrolling left
        }
    }


    //Stay within the lines
    const margin = 10;
    //if (newMax <= newMin + margin) {newMax = newMin + margin;}
    if (newMax >= maxLines) {newMax = maxLines;}
    if (newMax <= 1) {newMax = oldMax;}
    //if (newMin >= newMax - margin) {newMin = oldMin;}
    if (newMin <= 1) {newMin = 1;}

    console.log(Date.now(), `handleChartScroll: zoomCenter=`, zoomCenter, `newMin=`, newMin, ` newMax=`, newMax );

    
    xAxis.options.min = newMin;
    xAxis.options.max = newMax;

    // Update the chart
    chart.update();
    await new Promise(resolve => setTimeout(resolve, 200)); // Wait to debounce
}












function applyCustomFilter(selectedColumn,selectedOperator,filterValue, callback) {
    console.log(Date.now(), ` applyCustomFilter: ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ starting selectedColumn_Operator_Filter=`, selectedColumn, selectedOperator, filterValue );
    if (selectedColumn == 'changepointIndex1') { newselectedColumn = 'upInt'}; // name change only used for display
    if (selectedColumn == 'changepointIndex2') { newselectedColumn = 'dwnInt'};
    searchText.push(newselectedColumn + selectedOperator +filterValue); // Add the new filter text to the searchText
    console.log(Date.now(), ` applyCustomFilter: searchText=`, searchText);
    document.getElementById('filters_text').textContent = searchText; //update text field with current filter
    let filtercount = 0;
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        const columnIndex = settings.aoColumns.findIndex(col => col.data === selectedColumn);
        //console.log(Date.now(), ` applyCustomFilter: columnIndex=`, columnIndex);
        if (columnIndex != -1) {  //don't go past available rows
            let columnValue = data[columnIndex];
            //console.log(Date.now(), ` applyCustomFilter: columnValue=`, columnValue);
            //console.log(Date.now(), ` applyCustomFilter: columnValue=`, columnValue, `filterValue=`, filterValue, `filtercount=`, filtercount);
            filtercount ++;

            if (selectedOperator === "like") {
                return columnValue.includes(filterValue);
            } else {
                switch (selectedOperator) {
                    case "=": return columnValue === filterValue;
                    case "<": return columnValue < filterValue;
                    case "<=": return columnValue <= filterValue;
                    case ">": return columnValue > filterValue;
                    case ">=": return columnValue >= filterValue;
                    case "!=": return columnValue !== filterValue;
                    case "Or": 
                        const oldcolumnValue = columnValue; //save results of last filter
                        clearCustomFilter(); // revert table to before last filter
                        console.log(Date.now(), ` applyCustomFilter: Or clearCustomFilter run`);
                        return oldcolumnValue.includes(filterValue);
                    default: return true; // No filtering if operator is not recognized
                }
            }
        }
    });
    console.log(Date.now(), ` applyCustomFilter: redrawing table`);
    $('#csvTable').off(); // Unbind all listeners
    table.off('csvTable order.dt', orderEventListener);
    table.draw();
    clearChart(`applyCustomFilter`);

    console.log(Date.now(), ` applyCustomFilter: resetting the listeners`);
    setClickedRowListener('applyCustomFilter');  
    updateOrderListener('applyCustomFilter');
    // Remove previous 'highlighted' class from all table rows
    //$('#csvTable tbody tr').removeClass('highlighted');
    //Highlight the new table rows
    //for (let i = 0; i < showRows; i++) {
    //    highlightRow(i, "applyCustomFilter");
    //}
    console.log(Date.now(), ` ---------------------applyCustomFilter: callingback`);
    callback();  
}


function clearCustomFilter(all) {
    lastFilterClicked = 'clear'; 
    if (all == 'all') {
        lastFilterClicked = 'clearAll'; // stop order and scroll listeners from acting
        console.log(Date.now(), ` clearCustomFilter: clearing all filters`);
        while ($.fn.dataTable.ext.search.length > 0) {
            console.log(Date.now(), ` clearCustomFilter: clearing`, $.fn.dataTable.ext.search);
            $.fn.dataTable.ext.search.pop(); // remove each filter from the table
            searchText.pop(); // remove the recent fitler from the searchtext shown in the display filter list UI
        }
    } else {
        lastFilterClicked = ''; // ok to redraw
        console.log(Date.now(), ` clearCustomFilter: clearing most recent filter`);
        $.fn.dataTable.ext.search.pop(); // remove the recent filter from the table
        searchText.pop(); // remove the recent fitler from the searchtext shown in the display filter list UI
    }
    $('#filter-field').val(''); //reset the input fields
    $('#filter-type').val('=');
    $('#filter-value').val('');
    table.draw();
    document.getElementById('filters_text').textContent = searchText;
    lastFilterClicked = ''; 
}


// Function to highlight a specific row by its index
function highlightRow(rowIndex, callerName) {
    if (DR = true && TR == true){
        console.log(Date.now(), ` highlightRow: highlighting -------------- begin--------------- row: `, rowIndex, `Call from: `, callerName);
        $('#csvTable tbody tr:eq(' + rowIndex + ')').trigger('click');  //send a trigger event to the table row
        //console.log(Date.now(), ` highlightRow: highlighting --------------completed------------ row:  `, rowIndex, `, Call from: `, callerName);
    } else {
        console.log(Date.now(), ` highlightRow: Not Ready when received command to highlight row: `, rowIndex, ` Call from: `, callerName);
    }

}


// Function to fetch and process the CSV file
async function loadCSVFromCDN() {
    let st = Date.now();
    try {
        // Fetch the CSV file from the CDN
        const response = await fetch(csvFileUrl);
        if (!response.ok) {
            throw new Error(Date.now(), ` loadCSVFromCDN: Failed to fetch the CSV file.`);
        } 
        //console.log("loadCSVFromCDN: Loaded CSV file.", response);
        const csvContent = await response.text(); // Read the CSV content
        //console.log("CSV file loaded with length of:", csvContent.length); 
        const parsedCSVData = parseCSV(csvContent, 1); // Parse the CSV data
        console.log(Date.now(), ` loadCSVFromCDN: parsedCSVData=`, parsedCSVData, `File Load Duration=`, Date.now()-st);
        
        //clearGlobalVars();

        let results = await preProcess(parsedCSVData);
        console.log(Date.now(), ` loadCSVFromCDN: postProcess results=`, results);

        //console.log(Date.now(), ` loadCSVFromCDN: await calculateFileStatistics`);
        await calculateFileStatistics(parsedCSVData, 1, 1);  // running a second time to get updated modeCheckPointIndex columns 
        console.log(Date.now(), ` loadCSVFromCDN: done calculateFileStatistics`);

    } catch (error) {
        console.error(Date.now(), ` loadCSVFromCDN: Error loading CSV file`, error);
    }
}

function clearGlobalVars() {
    //Clear all globals and text fields
    KPI1Countername = []; //clearing previous KPIs
    normalizedKPI1Values = []; //clearing previous KPI values
    Growingcounter_list_array = [];
    Decliningcounter_list_array = [];
    KPIcounter_list_array = [];
    document.querySelector('#upCounter_text').innerHTML = ``;
    document.querySelector('#dwnCounter_text').innerHTML = ``;
    document.querySelector('#KPICounter_text').innerHTML = ``;
    document.querySelector('#GPTmsg_text').innerHTML = ``;
    document.getElementById('file1Size').textContent = ``;
    document.getElementById('file1CounterCount').textContent = ``;
    document.getElementById('file1NotCounted').textContent = ``;
    document.getElementById('file1Counted').textContent = ``;
    //document.getElementById('file1IntervalCount').textContent = ``;
    document.getElementById('file1ElapsedTime').textContent = ``;
    document.getElementById('file1IntervalDur').textContent = ``;
    document.getElementById('Changepoint1').textContent = ``;
    document.getElementById('Changepoint1b').textContent = ``;
    document.getElementById('Changepoint2').textContent = ``;
    try {
        clearChart('clearGlobalVars');  // fails if no chart exists but otherwises clears between file loads
    } catch {}

    console.log(Date.now(), ` clearGlobalVars: Global vars and text fields reset`);
}


function updateStatsText(counterCount, elapsedTimeInSeconds, notcounted) {
    document.getElementById(`file1CounterCount`).textContent = `${counterCount} Perf Counters`;
    document.getElementById(`file1ElapsedTime`).textContent = `${elapsedTimeInSeconds.toFixed(2)} Elapsed Seconds`;
    let file1IntervalDur = elapsedTimeInSeconds / maxLines;
    document.getElementById('file1IntervalDur').textContent = `${file1IntervalDur.toFixed(2)} Seconds per Interval`;
                    
    //update stats with number of any zero counter value
    document.getElementById(`file1NotCounted`).textContent = `${notcounted} Zero value Counters`;
    document.getElementById(`file1Counted`).textContent = `${counterCount - notcounted} Valid Counters`;
    console.log(Date.now(), ` calculateFileStatistics: FINAL altTransposedAggData calculated filestats`);

}



        // Function to create or recreate the DataTable
        function buildTable(data) {
            //TR = true;
            updateProgress(0, 0, "Building Table");
            console.log(Date.now(), ` buildTable: looking for existing table build`, table);
            if (table) {
                console.log(Date.now(), ` buildTable: unbinding tbody and order listeners`);
                $('#csvTable').off(); // Unbind all listeners
                // Destroy the existing DataTable instance
                console.log(Date.now(), ` buildTable: clearing existing table build`);
                table.clear().draw(false); // makes destroy faster
                table.destroy();
                table = [];
                lastclickedRowNumber = 0; // reset this whenever table is created
            }
            console.log(Date.now(), ` buildTable: Building new table for data`, data);
            table = $('#csvTable').DataTable({
                data: altTransposedAggData, // Load data from CSV formated array
                responsive: true, 
                paging: true,
                pageLength: 200,
                scrollY: '160px',
                searching: true, 
                autoWidth: true,
                columns: [
                    { title: "Countername", data: "Countername", width: '100px'}, 
                    { title: "BaseAvg", data: "baseAvgValue" },
                    { title: "ImmedMed", data: "ImmedMedianValue" },
                    { title: "LoadMax", data: "loadmaxValue" },
                    { title: "PostMin", data: "postminValue" },
                    //{ title: "Slope", data: "intervalSlope" },
                    //{ title: "upCount", data: "upCounter" },
                    //{ title: "peakInt", data: "peakInt" },
                    { title: "upInt", data: "changepointIndex1" },
                    { title: "dwnInt", data: "changepointIndex2" },
                    { title: "grow%", data: "growthIndex" }, 
                    { title: "KPIsim", data: "KPI1similarity" },
                    //{ title: "rowNum%", data: "rowNum" },
                ],
                columnDefs: [
                    { 
                        type: 'num', 
                        targets: [1, 2, 3, 4, 5, 6, 7, 8] ,
                        render: function (data, type, row) {
                            // Check if the data is a number
                            if (type === 'display' && typeof data === 'number') {
                                // Format numbers with commas for thousands separators and pass through the decimals
                                return data.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 20 });
                            }
                            return data; // Return data as-is for other types or non-numeric values
                        }
                    }, // Sort Columns (0-based index) as numbers
                ],
                
                initComplete: function () { // This callback is triggered when the DataTable is fully initialized
                    console.log(Date.now(), ` buildTable: initComplete`);
                    updateProgress(0, 0, "buildTable: initComplete");
                    TR = true;

                    setTimeout(function() {
                        //postProcess(altTransposedAggData);  //dont need since moving to preProcess
                        createChart();
                        setChartScrollListener();
                        new $.fn.dataTable.FixedHeader(table); // setting header to fixed
                        console.log(Date.now(), ` buildTable updating setClickedRow and updateOrder Listeners`);
                        updateProgress(0, 0, "updating Listeners");
                        
                        setClickedRowListener('buildTable');
                        updateOrderListener('buildTable'); //
                        setRightClickRowListener('buildTable');

                        //table.column(0).width(100);
                        $('#csvTable tbody td:nth-child(1)').css('white-space', 'nowrap');
                        
                        updateProgress(0, 0, "Highlighting top Rows");
                        console.log(Date.now(), ` buildTable: highlighting `, showRows, ` rows.`);                    
                        
                        if (lastFilterClicked == 'KPI') {
                            table.order([8, 'desc']).draw(); //SetKPI: This can be a slow step. change from column 11 to 8

                        } else {  //normal table build and highlight first 4.
                            for (let i = 0; i < showRows; i++) {
                                console.log(Date.now(), ` buildTable: highlighting row`, i);
                                highlightRow(i, "buildTable");    
                            }
                        }


                        
                        setScrollListener('buildTable'); //do this last. only user should scroll.
                        updateProgress(0, 0, "Done");
                    }, 50); //adding time to ensure table completes
                    
                }
                
            }); return table;
        }
    
          // Function to update the chart with a new dataset
          function updateChart(columnValues, label) {
            let x = [];
            let y = [];
            // Populate the array with data
            for (let i = 0; i < columnValues.length; i++) {
                x.push(i);
                y.push(columnValues[i]);
            }
            // Create a new dataset
            let newDataset = {
                label: label, // Label for the dataset
                data: y,
                borderColor: stringToColor(label),
                borderWidth: 2,
                pointRadius: 0
            };
            datasets.push(newDataset); // Push the new datasets into the array  
            chart.data.datasets = datasets;
            chart.update();
            updateVerticalLine();
            console.log(Date.now(), ` updateChart: datset for chart`, datasets);  // zero index
        }

        // Hash each label so it has a unique and persistant color
        function stringToColor(str) {
            //console.log(Date.now(), ` stringtoColor str=`, str);
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
                //console.log(`hash ${i} = ${hash}`);
            }
            const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
            return "#" + "00000".substring(0, 6 - c.length) + c;
        }


        function clearChart(caller) {
            console.log(Date.now(), ` clearChart: Remove all datasets from the chart. Called by `, caller);
            chart.data.datasets = [];
            datasets = [];
            chart.update();
        }


        function createChart() {
            let x = [];
            let y = [];

            // Populate the array with a line of demo data, same length as parsedData
            for (let i = 0; i < maxLines; i++) {
                x.push(i);
                y.push(0);  // Use the func to create next y value
            }

            //Delete any existing chart from memory
            if(chart) {
                console.log(Date.now(), ` createChart: destroying chart before createChart`);
                chart.destroy();
            }
                
            //Create new chart
            chart = new Chart(document.getElementById('chartCanvas').getContext('2d'), {
                type: 'line',
                data: {
                    labels: x,
                    datasets: [{
                        label: '',
                        data: y,
                        borderColor: 'green',
                        borderWidth: 2,
                        pointRadius: 0,
                    }]
                },
                options: {
                    interaction: {
                        intersect: false
                    },                
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Time Intervals'
                            },
                            min: 0,
                            max: maxLines
                        },                      
                        y: {
                            title: {
                                display: true,
                                text: '% of Max'
                            },
                            min: 0,
                            max: 1.01
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            layout: 'horizontal',
                            align: 'center',
                            /* verticalAlign: 'top', */
                            position: 'top',
                            labels: {
                                generateLabels: function(chart) {
                                    const maxLegendItems = 4; // Adjust this to limit the number of legend items
                                    const allLabels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                    return allLabels.slice(-maxLegendItems); // Display the last maxLegendItems labels
                                }
                            }
                        }, 
                        title: {
                            display: true,
                            text: "Perf Counters Highlighted"
                        },
                        drawTime: "beforeDatasetsDraw",
                        annotations: [
                            {
                                type: "line",
                                mode: "vertical",
                                scaleID: "x",
                                borderColor: "blue",
                                borderWidth: 10,
                                value: 0, //currentLinePosition, // Initial position of the line
                            },
                        ]

                    }
                }
            });
        }

        // update the vertical line position
        function updateVerticalLine() {
            const chartCanvas = document.getElementById("chartCanvas");

            const verticalLine = document.getElementById("verticalLine");
            const xPosition = ((currentLinePosition / maxLines) * chartCanvas.width)/1.05 + 48;  //slight skew correction and margin needed 
            verticalLine.style.left = xPosition + "px"; // Update the left CSS property

            const verticalLine2 = document.getElementById("verticalLine2");
            const xPosition2 = ((currentLinePosition2 / maxLines) * chartCanvas.width)/1.05 + 48;  //slight skew correction and margin needed 
            verticalLine2.style.left = xPosition2 + "px"; // Update the left CSS property
            //console.log(`currentLinePosition=`, currentLinePosition, `chart.width=`, chart.width);

            //const verticalLine3 = document.getElementById("verticalLine3");
            //const xPosition3 = ((currentLinePosition3 / maxLines) * chartCanvas.width)/1.05 + 48;  //slight skew correction and margin needed 
            //verticalLine3.style.left = xPosition3 + "px"; // Update the left CSS property
            //console.log(Date.now(), `updateVerticalLine: currentLinePosition3=`, currentLinePosition3, `chart.width=`, chart.width);

            const verticalLine_modeCPI1 = document.getElementById("verticalLine_modeCPI1");
            const xPosition_modeCPI1 = ((modeCPI1 / (maxLines)) * chartCanvas.width)/1.05 + 60;  //slight skew correction and margin needed 
            verticalLine_modeCPI1.style.left = xPosition_modeCPI1 + "px"; // Update the left CSS property
            //console.log(Date.now(), ` updateVerticalLine: currentLinePosition_modeCPI1=`, modeCPI1, `chart.width=`, chart.width);
            
            const verticalLine_modeCPI1b = document.getElementById("verticalLine_modeCPI1b");
            const xPosition_modeCPI1b = ((modeCPI1b / maxLines) * chartCanvas.width)/1.05 + 60;  //slight skew correction and margin needed 
            verticalLine_modeCPI1b.style.left = xPosition_modeCPI1b + "px"; // Update the left CSS property
            //console.log(Date.now(), ` updateVerticalLine: currentLinePosition_modeCPI1=`, modeCPI1, `chart.width=`, chart.width);

        }

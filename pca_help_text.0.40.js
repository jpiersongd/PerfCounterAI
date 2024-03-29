var FileEntry_question_mark_text = ""+ 
"The Demo1 file is shown by default. Select another Demo button to see examples." +
"\n - Demo1 is a capture of a youtube video starting and running for a while." +
"\n - Demo2 is currently a copy of demo1"+
"\n - Demo3 is very large, having 50k counters. It needs time to process. This is a capture of a camera security system starting." +
"\n - Choose File: Upload one of your own CSV files to analyse." ;

var FileStats_question_mark_text = ""+ 
"The FileStats panel shows the number of Perf Counters found"+
"\nin the uploaded file and the status of those counters."+
"\n - Counters having only zero as a value are filtered out of the tableData as they have no pattern."+
"\n - The number of sample Intervals and the elapsed time indicate the duration and resolution of the capture file contents"+
"\n - Intervals with the most growth or decline have the most number of counters changing tragectory within any interval."

var displayFilters_text = "" +
"The Automatic display filters help you find the most common patterns." +
"\n\n- Growth: show only the counters that had a major growth change on the highest change interval " +
"\n- Decline: show only counters that had a major decline change on the highest change interval " +
"\n- ** Spikes: show or remove all counters that only show spike behavior ** " +
"\n- ** Oscillators: show or remove all counters that regularly cycle up and down ** " +
"\n--------------- ** The double-asterisc features are not working yet.";

var dataTable_question_mark_text = "" +
"These are statistical aggregations for each Countername from the user's uploaded CSV Perf Counter File." +
"\n- Countername, max, min, avg, median are exactly what they sound like" +
"\n- Slope is the slope between the first two samples and the last throw" +
"\n- upCount is the number of samples that were larger than the previous sample" +
"\n- peaks is the number of samples that reach 99% of the max for that counter" +
"\n- upInt is the sample interval that has the most number of counters growing significantly in that interval" +
"\n- dwnInt is the interval with the most counters declining significantly in that interval" +
"\n- growth is a growth rate that is weighted by proximity to the first Interval - hence growth at the beginning of the trace:" +
"\n- KPIsim% indicates a counter's similarity to a (right-click) selected KPI counter. 1 = 100% similarity."+
"\n-------- Clicking and Scrolling the Table---------"+
"\nClick on any of the headers to sort. Click on any row to Highlight or Unhighlight." +
"\n\nUse the Slider to change the number of rows highlighted automatically." +
"\nUse the Up/Down arrows to scroll the highlighter down the table list." +
"\nRight click on any row to set a KPI. This will recalculate the 'Similar' column." ;


var control_question_mark_text = ""+
"Use the Highlighter slider to set the number of rows that are automatically"+
"\nhighlighted when the table is sorted or arrowdown/up is used.";

var customDisplayFilter_question_mark_text = ""+
"Use the custom filter dropdown to show only items matching."+
"\n- Use the [ Set ] button to add a filter"+
"\n- Use the [ Clear ] button to remove the previous filter added.";


var chart_question_mark_text = "" +
"The chart shows a number of counter lines, deturmined by the Highlight Slider."+
"\nEach line color is a unique hash of the counter's name so that it persists."+
"\nThe X-axis shows the elapsed time of the counter file, per sample interval."+
"\nNote the chart's 'normalized' Y scale is zero to one. All values are a percentile of the max value seen."+
"\nThis normalization allows counters of all ranges to be shown in one chart, but keep in mind, the max seen may not be the max possible."+
"\n"+
"\nThe Green and Orange markers at the bottom indicate the 'upInt' and dwnInt', the most significant Up and Down Time Interval for the last counter highlighted.";
//"\nThe Blue marker shows the 'peakInt', the first interval when a counter hit it's Max.";

var analysisButtons_question_mark_text = "" +
"The 'Analysis Actions' will run steps to look for interesting counters in your data and then provide information about those counters."+
"\n- Step1: Click the Growth button to identify the top growing  counters during the peak growth sample interval."+
"\n- Step2: Click on the Decline button to identify the coutners with the most decline during the same peak change sample interval."+
"\n- Step3: Reach out to OpenAi Assistant for help interpreting the top counters found.";


var export_button_text = "" +
"Export chart to a CSV or JSON file." +
"\n..............This feature is not working yet........";


var tableExportButton_text = "" +
"Export table to a CSV or JSON file." +
"\n..............This feature is not working yet........";

var Domino_effect_text = "" +
"The Domino Effect concept is a phenomena where changes in one counter are seen to precede changes in a series of other counters."+
"\nHere is a common example: "+
"\n** note: at each step, a counter can be considered a 'Parent', or 'Child', in its impact to another counter."
"\n- Morning users are ramping up load on a system."+ 
"\n- The DataBase Transaction Logs are writing to a Temp DB."+
"\n- Temp DB is flushed to disk regularly"+
"\n- Memory usage us growing due to the app consuming memory on a per user basis"
"\n- Memory usage hits a flat line maximum"+
"\n- Garbage Collection and other services are flushing memory to disk"+
"\n- Disk I/O is ramping up"+
"\n- Disk Queue Length ramps up"+
"\n- Transaction Log truncation is blocked from writing to disk"+
"\n- Memory GC is not reducing at rate of user load surging."+
"\n Transaction response time are increased at exponential rate";

//user or task->CPU and Memory usage->Garbage Collection->Memory Page swapping->Disk I/O->Disk Queuing->Disk transactions latency


var version_help_text = "" +
"v0.36 - Feb 1 2024 - workers deployed in parrallel to speed up math calcs. Added Similarity using STAMP function... very slow 30 seconds."+
"\nv0.37 - Feb 7 2024 - New Similarity function is 15x faster. Cleaned up UI commas and decimals. Beginning automation Actions"+
"\nv0.38 - Feb 15 2024 - Added backend to OpenAI Assistant. Reduced and optimized text sent to user and to Assistant."+
"\nv0.39 - Feb 19 2024 - PreProcess Start and Stop-load now only 100ms instead of whole second pass, Add goal-posts, BaseAvg,ImmedMed, LoadMax, PostMin."+
"\nv0.40 - Mar 11 2024 - Enabling new forms of TS data, such as 9-axis (Accel, Gyro, Mag), ECG from Apple devices. Add Zoom and Pan to the chart.";

var GettingStarted_Text = "" +
"<b>Getting Started:</b>"+
"<br>Click on the 'Growth' and 'Decline' to auto filter to the top changing counters."+
"Sift through the counters by filtering and sorting.</br>"+
"<br>Right click on a row in the table to select one counter as your Key Perf Indicator."+
"This will update the KPISimilarity column with a sortable index for each counter indicting its similarity to the KPI.</br>"+
"<br>Click the 'Ask' button once you have selected three counters.</br>";

var Example_counter_Text = ""+
"<p><br>Example Analysis from ChatGPT"+
"<p><b>Counter:\Memory\Modified Page List Bytes</p></b>"+
"<ul><li>Measurement: current memory size (bytes) </li>"+
"<li>Feature measured: The modified page list</li>"+
"<li>Feature's purpose: A collection of memory pages that have been changed but whose changes haven't been saved to their respective files or disk locations.</li> </ul> "+
"<p><b>Other counters</b> likely impacted by Domino Effect:"+
"<br><ul><li>Downstream decendants/children:"+
"<ul><li>Disk\%Queue Length% : corresponding behavior</li>"+
"<li>Memory\Standby Cache Reserve Bytes : reciprical behavior</li></ul></li>"+
"<li>Upstream ancestors/parents:"+
"<ul><li>Memory\%Total% : reciprocal behavior</li>"+
"<li>...</li></ul></li></ul></p> ";


var verticalLine_modeCPI1_text = ""+
"The vertical line on the left corresponds to the Time Interval with the most number of counters with their largest growth being on this interval."+
"\nThe line on the right is when most counters had their largest decline."+
"\nTogether, these lines are the goal-posts that delineate between Baseline, Load, and Post-Load Time intervals."+
"\nTo the left of the left line is the Baseline. Between the two lines is the load time segment. To the right of the right-hand line is the Post load.";




// set the title
window.addEventListener('load', function() {
    this.setTimeout(function() {
        console.log(Date.now(), ` Listener for 'load': adding help_text`);
        document.querySelector('#FileEntry_question_mark').setAttribute('title', FileEntry_question_mark_text);
        document.querySelector('#FileStats_question_mark').setAttribute('title', FileStats_question_mark_text); 
        document.querySelector('#control_question_mark ').setAttribute('title', control_question_mark_text ); 
        document.querySelector('#customDisplayFilter_question_mark').setAttribute('title', customDisplayFilter_question_mark_text);
        document.querySelector('#display_filter_question_mark').setAttribute('title', displayFilters_text);
        document.querySelector('#dataTable_question_mark').setAttribute('title', dataTable_question_mark_text);
        document.querySelector('#chart_question_mark').setAttribute('title', chart_question_mark_text); 
        document.querySelector('#analysisButtons_question_mark').setAttribute('title', analysisButtons_question_mark_text);
        document.querySelector('#exportButton').setAttribute('title', export_button_text);
        document.querySelector('#tableExportButton').setAttribute('title', tableExportButton_text);
        document.querySelector('#version_help_text').setAttribute('title', version_help_text);
        document.querySelector('#GettingStarted_Text').innerHTML = GettingStarted_Text;
        document.querySelector('#verticalLine_modeCPI1').setAttribute('title', verticalLine_modeCPI1_text);
        
    }, 100);
});



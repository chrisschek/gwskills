// call it with this:
// constructTable('#skills-table')

function constructTable(selector) {

    // Getting the all column names
    var cols = ['Icon', 'Name', 'Description', 'Costs', 'Attribute', 'Campaign'];

    // Traversing the JSON data
    for (var i = 0; i < list.length; i++) {
        var row = $('<tr/>');   
        for (var colIndex = 0; colIndex < cols.length; colIndex++)
        {
            var val = list[i][cols[colIndex]];

            // If there is any key, which is matching
            // with the column name
            if (val == null) val = "";  
                row.append($('<td/>').html(val));
        }

        // Adding each row to the table
        $(selector).append(row);
    }
} 

var list = [
    { "Icon": "icon1", "Name": "name1" },
    { "Name": "name2", "Description": "desc2" },
    { "Name": "name3", "Description": "desc3", "Icon": "icon3", "Campaign": "camp3" }
];

$(document).ready(function(){

    console.log("doing document ready callback")
    console.log("gonna try to build table")

    constructTable("#skills-table")

    console.log("finished trying to build table")

});
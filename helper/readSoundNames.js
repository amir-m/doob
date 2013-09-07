var walk = require('walk'), fs = require('fs'), walker, folders = [], 
	fileWalker, base = '/apps/hm/public/wav/', index = 0, url = '/public/wav/';

walker = walk.walk(base);

// walker.on("file", function (root, fileStats, next) {
//     // fs.readFile(fileStats.name, function () {
//     //   // doStuff
//     // });
//     console.log(fileStats);
//     next();
// });

walker.on("directories", function (root, dirStatsArray, next) {
	for (var i = 0; i < dirStatsArray.length; ++i)
		// console.log(dirStatsArray[i].name);
		folders.push(dirStatsArray[i].name);
		
    next();
});

walker.on("end", function () {
    console.log("finish with directories");
    console.log(folders)
    readFilenames(0);
});

function readFilenames(folderNameIndex) {
	
	if (folderNameIndex == folders.length) {
		console.log('finished!');
		return;
	}

	fileWalker = walk.walk(base+folders[folderNameIndex]);

    var append = "", 
        pre = '},\n{\n"category": "'+folders[folderNameIndex]+'",\n' +
    '"sounds": [';

	fileWalker.on("file", function (root, fileStats, next) {

        var fname = fileStats.name;

        if (fname.indexOf("#") != -1) {
            t = fname.replace("#","_SHARP");
            fs.renameSync(base + folders[folderNameIndex]+'/'+ fname, 
                          base + folders[folderNameIndex]+'/'+ t);
            fname = t;
        }

        fname = fname.toLowerCase();

        fs.renameSync(base + folders[folderNameIndex]+'/'+ fileStats.name, 
                          base + folders[folderNameIndex]+'/'+ fname);

    	append += '{' + '"name": "' + fname.split('.')[0] + '", ' +
    		'"soundtype": "' + (folders[folderNameIndex] == 'impulses' ? 'impulse' : 'sound') + 
            '", "url": "' + url + folders[folderNameIndex]+'/'+fname + '"},';
            next();
	});

	fileWalker.on("end", function () {
    
    	console.log('finished reading %s', base+folders[folderNameIndex]);
        append = append.substr(0, append.length - 1);
        append += ']\n';

        pre += append;
        
        fs.appendFile('/apps/hm/helper/sounds.js', pre.toLowerCase(), function(error) {
            if (error) throw error;
        });
    	readFilenames(++index);
	});
}


// var walk = require('walk'), fs = require('fs'), walker, folders = [], 
//     fileWalker, base = '/apps/hm/public/wav/', index = 0, url = '/public/wav/';

// walker = walk.walk(base);

// // walker.on("file", function (root, fileStats, next) {
// //     // fs.readFile(fileStats.name, function () {
// //     //   // doStuff
// //     // });
// //     console.log(fileStats);
// //     next();
// // });

// walker.on("directories", function (root, dirStatsArray, next) {
//     for (var i = 0; i < dirStatsArray.length; ++i)
//         // console.log(dirStatsArray[i].name);
//         folders.push(dirStatsArray[i].name);
        
//     next();
// });

// walker.on("end", function () {
//     console.log("finish with directories");
//     console.log(folders)
//     readFilenames(0);
// });

// function readFilenames(folderNameIndex) {
    
//     if (folderNameIndex == folders.length) {
//         console.log('finished!');
//         return;
//     }

//     fileWalker = walk.walk(base+folders[folderNameIndex]);

//     var pre = '},\n{\n"category": "'+folders[folderNameIndex]+'",\n';

//     fileWalker.on("file", function (root, fileStats, next) {

//         var append = pre + '"resource":\t{\n' + 
//         '\t"name": "' + ((fileStats.name).toString().split('.'))[0] + '",\n' +
//             '\t"soundtype": "' + (folders[folderNameIndex] == 'impulses' ? 'impulse' : 'sound') + '",\n' +
//             '\t"url": "' + url + folders[folderNameIndex]+'/'+fileStats.name + '"\n' +
//             '\t}\n';

//         fs.appendFile('/apps/hm/helper/sounds.js', append, function(error) {
//             if (error) throw error;
//             next();
//         });
//     });

//     fileWalker.on("end", function () {
    
//         console.log('finished reading %s', base+folders[folderNameIndex]);
//         readFilenames(++index);
//     });
// }


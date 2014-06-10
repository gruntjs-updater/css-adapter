/*
 * css-adapter
 * http://github.com/donghanji/css-adapter/
 *
 * Copyright (c) 2013 donghanji, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        adapter:{
            options:{
                "compile":"",
				"dpi":{
					"standard":1024,
					"broad":{
						
					},
					"narrow":{
						
					}
				},
				"others":{
					
				},
				"mins":{
					
				},
				"maxs":{
					
				}
            },
			/*dist:{
				src:["samples/test4.css"],
				dest:"samples/test4.adapter.css"
			}*/
			dist:{
				files:{
					"samples/test4.adapter.css":["samples/test4.css"]
				}
			}/**/
			/*dist:{
				files:grunt.file.expandMapping(['samples/*.css'], '', {
                    rename: function(base,file) {
                        
                        return file.replace(/\.css/i,'.adapter.css');
                    }
                })
			}*/
        }
    });
    
    grunt.loadTasks('tasks');
    
    grunt.registerTask('default',['adapter']);
};
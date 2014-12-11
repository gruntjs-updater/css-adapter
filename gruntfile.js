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
					
				},
                "prefixs":['-webkit-','-moz-','-ms-','-o-'],
                'adapters':{
                    'attrs':['border-image','border-radius','box-shadow','background-origin','background-clip','background-size','display','box-sizing','box-pack','box-flex','transform','transform-origin','animation','transition'],
                    'vals':{
                        'display':'box'
                    }
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
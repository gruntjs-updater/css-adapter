css-adapter
===========



##### css adapter, to handle different adaptation of the equipment.

## Getting Started
This plugin requires Grunt ~0.4.1
If you haven't used <a href="http://gruntjs.com/">Grunt</a> before, be sure to check out the <a href="http://gruntjs.com/getting-started">Getting Started</a> guide, as it explains how to create a <a href="http://gruntjs.com/sample-gruntfile">Gruntfile</a> as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

    npm install css-adapter
Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:
    
	adapter:{
        options:{
            "compile":"",
            "dpi":{
                "max-width":"1200px",
                "standard":1024,
                "broad":{
                    
                },
                "narrow":{
                    
                }
            },
            "units":{
                "em":0.5
            },
            "others":{
                
            },
            "mins":{
                
            },
            "maxs":{
                
            },
            "prefix":['-webkit-','-moz-','-ms-','-o-']
        },
        /*dist:{
            src:["samples/test4.css"],
            dest:"samples/test4.adapter.css"
        }*/
        /*dist:{
            files:_FILES
        }*/
        dist:{
            files:grunt.file.expandMapping(['*samples.css','!samples*.adapter.css'], '', {
                rename: function(base,file) {
                    
                    return file.replace(/\.css/i,'.adapter.css');
                }
            })
        }
    }
	
	
	grunt.loadNpmTasks('css-adapter');
	
#### You can use it in combination with the grunt-contrib-watch,like this:
    watch:{
        scripts:{
            files:['samples/*.css','!samples/*.adapter.css'],
            tasks:['adapter'],
            options:{
                debounceDelay:200,
                interrupt:true
            }
        }
    }
    
    grunt.loadNpmTasks('grunt-contrib-watch');

##Settings
    "compile"(""|"all"|"standard"|"broad"|"narrow"):Debug and easy to view the results,
    "dpi":{//about dpi set,minimum width ,maximum width, and for the specific dpi value
        "min-width":
        "max-width":
        "standard":
        "broad":{
            "1200":{
                
            }
        },
        "narrow":{
            "320":{
                
            }
        }
    },
    "units":{//for the digit units,like px,em, and %
        "px":20,
        "em":0.5
    },
    "others":{//
        "margin-top":10
    },
    "mins":{
        "font-weight":100
    },
    "maxs":{
        "font-weight":900
    }
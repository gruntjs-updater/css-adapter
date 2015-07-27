/*
 *
 *
 */

'use strict';

var fs=require('fs')
	,path=require('path');


var M_WIDTH={
	'broad':'min-width',
	'narrow':'max-width'
}
,M_ADAPTER_ATTR=['border-image','border-radius','box-shadow','background-origin','background-clip','background-size','display','box-sizing','box-pack','box-flex','transform','transform-origin','animation','transition']
,M_ADAPTER_ATTR_VALUE={
	'display':'box'
}
,M_MINS_ATTR=['height','width','font-size','margin','margin-left','margin-right','margin-top','margin-bottom','padding','padding-left','padding-right','padding-top','padding-bottom','text-indent']
,M_MINS={
	'font-weight':100
}
,M_MAXS={
	'font-weight':900
}
,M_HANDINGS={
	'font-weight':function(value){
		value=Math.floor(value/100)*100;
		
		return value < 0 ? 0 : value;
	}
}
,M_REG={
	COMMENT:/\/\*[\S\s]*?\*\//g,
    KEYFRAMES:/@keyframes\s+(\w+)\s*(\{[^@]*\}\s*\})/gim,
	MEDIA:/@media\s+\(\s*(?:landscape|portrait)?\s*(?:broad|narrow)\s*\:\s*(?:\d+)px\)\s*(?:and\s+\(\s*(?:landscape|portrait)?\s*(?:broad|narrow)\s*\:\s*(?:\d+)px\)\s*){0,}\{([^@\(\)]*)\}\s*\}/gim,
	NORMALMEDIA:/@media\s+(?:\(normal(?:Max|Min|PX)?Width\s*\:\s*\d+px\)(?:\s+and\s+)?){0,}\s*\{[^@\(\)]*\}/igm,
	NORMAL:/((normal(?:Max|Min|PX)?Width)\s*\:\s*(\d+)px)/igm,
	RATIO:/\s*\(\s*(landscape|portrait)?\s*(broad|narrow)\s*\:\s*(\d+)px\s*\)\s*/gim,
	STYLESHEET:/\s*([^\{\}]*)\s*\{\s*([^\}]*)\s*\}/gim,
	CSS:/\s*(\w+-?\w*)\s*:((?:\s*(?:-?\d+(?:\.\d+)?)(?:px|%|em|rem)?\s*){1,4})/gim,
	CSS2:/\s*(\w+-?\w*)\s*:((?:\s*(?:-?\d+(?:\.\d+)?)(?:px|%|em|rem)?\s*){1,4};?)/gim,
	VALUE:/(-?\d+(?:\.\d+)?)(px|%|em|rem)?/gim
};

M_MINS_ATTR.forEach(function(k,i){
	M_MINS[k]=0;
});

function adapter(grunt,files,configs){
	var units=configs.units||{}
		,others=configs.others||{}
		,dpi=configs.dpi||{}
        ,mindpi=dpi['min-width']
        ,maxdpi=dpi['max-width']
		,standard=parseInt((dpi.standard||1024),10)
		,mode=configs.compile||''
		,mins=E({},M_MINS,configs.mins)
		,maxs=E({},M_MAXS,configs.maxs)
		,regions=configs.regions
        ,prefixs=configs.prefixs||[]
        ,adapters=configs.adapters||{}
        ,attrs=adapters.attrs
        ,vals=adapters.vals
		;
	
    var M_PREFIX=prefixs.concat('');//prefixs,like -webkit
    var M_K_PREFIX=[];
    var i=0;
    var len=prefixs.length;
    for(;i<len;i++){
        M_K_PREFIX.push('@'+prefixs[i]);
    }
    M_K_PREFIX.push('');//prefixs for keyframe,like @-webkit-
    
    //
    M_ADAPTER_ATTR=attrs === undefined ? [] : M_ADAPTER_ATTR;
    M_ADAPTER_ATTR_VALUE=vals === undefined ? [] : M_ADAPTER_ATTR_VALUE;
    
    //
    M_REG.ADAPTER=new RegExp('('+M_ADAPTER_ATTR.join('|')+')\s*\:\s*([^;\}]*)\s*(?:;|\})','gim');
    
    function R(attr,value,unit){
		var minv=parseFloat(mins[attr],10)
			,maxv=parseFloat(maxs[attr],10)
			,handle=M_HANDINGS[attr]
			;
		value=handle ? handle(value) : value;
		
		if(value < minv){
			
			return minv;
		}
		if(value > maxv){
			
			return maxv;
		}
		
		return value;
	};
    function H(value,scale,rule,unit){
        value=parseFloat(value,10);
        
        if(unit === '%'){//%,don't deal with
            
            return 0;
        }
        
        return Number(((scale*value).toFixed(4))||0);
    };
	function E(){
		var options,
			target=arguments[0]||{},
			length=arguments.length,
			i=1;
		if(length === i){
			target=this;
			--i;
		}
		for(;i<length;i++){
			options=arguments[i];
			if(typeof options === 'object'){
				for(var name in options){
					target[name]=options[name];
				}
			}
		}
		
		return target;
	};

	function EO(obj){
		for(var i in obj){
			
			return false;
		}
		
		return true;
	};
    function K(value){
        return value.replace(M_REG.KEYFRAMES,function(){
            var args=arguments;
            var a0=args[0];
            var a1=args[1];
            var a2=args[2];
            
            var kc=['keyframes',a1,a2].join(' ');//keysframes name {}
            
            return M_K_PREFIX.join(kc)+a0;
        });
    };
	function V(value){
		
		return value.replace(M_REG.ADAPTER,function(){
			var args=arguments
				,a0=args[0]
				,a1=args[1]
				,a2=args[2]
				;
			
            if(M_ADAPTER_ATTR_VALUE[a1]){
                
                if(M_ADAPTER_ATTR_VALUE[a1] === a2){//like display:box->display:-webkit-box;
                    var arr=[].concat(M_PREFIX)
                        ,r1=[]
                        ,r2=[];
                    arr.pop();
                    
                    r2.push(a2);
                    r2.push(';');
                    r2.push(a1);
                    r2.push(':');
                    
                    r1.push(a1);
                    r1.push(':');
                    r1.push(arr.join(r2.join('')));
                    r1.push(a2);
                    r1.push(';');
                    r1.push(a0);
                    
                    return r1.join('');//like border-radius:2px;->-webkit-border-radius:2px;
                }
                
                return a0;
            }
			
			return M_PREFIX.join(a1+':'+a2+';')+a0;
		});
	};
	//
	function to_styles(style,r2,r3,scale,tm,rm,px){
		var s=null;
		var css=[];
		scale=scale||1;
		tm=tm||[];
		rm=rm||[];
		r2=r2||'broad';
		while(s=M_REG.STYLESHEET.exec(style)){
					
			var c1=s[1]//css selector
				,c2=s[2]//rule
				;
				
			css.push(c1);
			css.push('{');
	        
			var o=c2.replace(M_REG.CSS2,'');
	        //like .class{-webkit--os--ms--}
	        if(o === M_PREFIX.join('')){
	            rm=[];
	        }
			if(o.trim() && o !== M_PREFIX.join('')){
				var t=[c1,'{',o,'}']//selector:{key:value;}
					,repeat=tm.join('').indexOf(t.join('')) === -1//don't repeat
					;
				if(rm.length && repeat){//for portrait or landscape
					
					rm=rm.concat(t);
				}
	            
				if(tm.length && repeat){
					
					tm=tm.concat(t);
				}
			}
			
			var a=null,
				b=null;
			while(a=M_REG.CSS.exec(c2)){
				b=true;
				var a1=a[1]//key
					,a2=a[2]//value
					;
	            css.push(a1);
				css.push(':');
				a2=a2.trim();
				var v=null;
				while(v=M_REG.VALUE.exec(a2)){
					var v1=v[1]//value,digit
						,v2=v[2]//unit
						;
					if(px && v2 === 'rem'){
						console.log(px,scale,v1,v2);
						scale=scale*px;
					}
					scale=scale||(r3-standard)/standard;
					var dr2=dpi[r2]||{}
						,dr3=dr2 ? dr2[r3]||{} : dr2
						,_units=dr3['units'] ? dr3['units'] : dr3
						,_others=dr3['others'] ? dr3['others'] : dr3
						;
					
					_units=EO(_units) ? units : _units;
					_others=EO(_others) ? others : _others;
					
					var value=parseFloat((_others[a1]||_units[v2]),10);
					var unit=px && v2 === 'rem' ? 'px' : v2;
					value=value ? value : v1;
					value=H(value,scale,a1,v2);
					if(!(px && v2 === 'rem')){
						value=parseFloat(v1,10)+value;
					}
					
					value=R(a1,value,v2);
	                
					css.push(value);
					css.push(unit||'');
					css.push(' ');
				}
				
				css.pop();//pop ' '
				css.push(';');
			}
			css.push('}');
			if(!b){//now digit value
				css.splice(css.length-3,3);//remove like .class{}
			}
		}

		return css.join('');
	};
	//
	function px2rem(str){
		var sp=str.split(M_REG.NORMALMEDIA);
        //console.log(sp.length);
        //
        if(sp && sp.length >1){
        	var str_1=sp[0];
        	var str_2=sp[1];
        	var str_n=str.match(M_REG.NORMALMEDIA);
        	if(str_n && str_n.length){
        		str_n=str_n[0];
        		var r=null;
        		var normal={};
        		while(r=M_REG.NORMAL.exec(str_n)){
        			
        			if(r && r.length >= 3){
        				normal[r[2]]=r[3];
        			}
        		}
        		var normalWidth=parseInt(normal['normalWidth'],10);
        		var normalMaxWidth=parseInt(normal['normalMaxWidth'],10)||768;
        		var normalMinWidth=parseInt(normal['normalMinWidth'],10)||320;
        		var normalPXWidth=parseInt(normal['normalPXWidth'],10)||10;

        		if(normalWidth){
        			var s=null;
        			var normal_scale=1/normalPXWidth;
        			var css=['@media (max-width:'];
        			css.push(normalMaxWidth);
        			css.push('px)');
        			css.push(' and (');
        			css.push('min-width:');
        			css.push(normalMinWidth);
        			css.push('px)');
        			css.push('{');
        			while(s=M_REG.STYLESHEET.exec(str_1)){
					
						var c1=s[1]//css selector
							,c2=s[2]//rule
							;
						css.push(c1);
						css.push('{');
						var a=null;
						var b=null;

						while(a=M_REG.CSS.exec(c2)){
							var a1=a[1]//key
							,a2=a[2]//value
							;
							//rem
							if(!/rem$/.test(a[0])){
								css.push(a[0]);
								css.push(';');
							}
							
							//
	                        css.push(a1);
							css.push(':');
							a2=a2.trim();
							var v=null;
							var no_empty=false;
							while(v=M_REG.VALUE.exec(a2)){
								var v1=v[1]//value,digit
									,v2=v[2]//unit
									;
								var value=value ? value : v1;
								var scale=v2 === 'rem' ? 1 :normal_scale;
								value=H(v1,scale,c2,v2);
								if(v2 === '%'){

									continue;
								}
								if(value){
									css.push(value);
									css.push('rem');
								}else{
									css.push(value);
								}
								
								b=true;
	                            no_empty=true;
								css.push(' ');
							}
							//
							if(no_empty){
								css.pop();//pop ' '
								css.push(';');
							}else{
								css.pop();
								css.pop();
								css.pop();
								css.pop();
							}
						};

						css.push('}');
						if(!b){//now digit value
							css.splice(css.length-3,3);//remove like .class{}
						}
					}
					css.push('}');


					if(regions && regions.length){
		        		var region_str=[];
		        		for(var i=0;i<regions.length;i++){
		        			var r3=parseInt(regions[i]);
		        			var scale=r3/normalWidth;
		        			region_str.push('@media (max-width:');
		        			region_str.push(r3);
		        			region_str.push('px){');

		        			var styles=to_styles(str_1,'broad',r3,scale,'','',normalPXWidth);
		        			region_str.push(styles);
		        			region_str.push('}');
		        		}
		        		//str=[regions.join(''),str].join('');
		        		//console.log(region_str.join(''));
		        		//str=region_str.join('')+str;
		        	}

		        	css=[region_str.join(''),css.join('')];

					return str.replace(M_REG.NORMALMEDIA,function(){

		        		return css.join('');
		        	})
        		}
        	}
        }

        return str;
	};

	return files.forEach(function(f){
		
		var valid=f.src.filter(function(filepath){
			
			// Warn on and remove invalid source files (if nonull was set).
			if (!grunt.file.exists(filepath)){
				grunt.log.warn('Source file "' + filepath + '" not found.');
				
				return false;
			}else{
				
				return true;
			}
		});
		
		var str=valid.map(function(f){
			
			return grunt.file.read(f);
		})
		.join('');
		
		str=str.trim().replace(M_REG.COMMENT,'');
		
		if(str.length < 1){
			
			return grunt.log.warn('Destination not written because CSS was empty.');
		}
        
        //px to rem change
        var str=px2rem(str);
        //return console.log(str);

		//browser adapter
		str=V(str);
		
		var m1=Number.MAX_VALUE
			,m2=0
			;
		//media query adapter
		str=str.replace(M_REG.MEDIA,function(){
			var args=arguments
				,style=args[1]//style
				,res=[]
				,r=null
				,tm=[]
				,rm=[]
				;
			
			style=style+'}';//
			
			while(r=M_REG.RATIO.exec(args[0])){
				var r1=r[1]//portrait or landscape
					,r2=r[2]//broad or narrow
					,r3=parseInt(r[3],10)//value
					;
				
				if(mode === 'standard'){//standard mode
					
					if(r3 !== standard){
						
						continue;
					}
				}else if(mode !== 'all' && (mode && r2 !== mode)){//broad or narrow
					
					continue;
				}else{
					//if(r2 === 'narrow' && r3 === standard){//remove narrow standard dpi
                    /*if(r2 === 'narrow' && r3 === standard){//remove narrow standard dpi
						
						continue;
					}*/
				}
				
				var css=[];
				css.push('\n\n@media ');
				if(r1){
					
					css.push('(');
					css.push('orientation');
					css.push(':');
					css.push(r1);
					css.push(')');
					css.push(' and ');
				}
				css.push('(')
				css.push(M_WIDTH[r2]);
				css.push(':');
				css.push(r3);
				css.push('px');
				css.push(')');
                
                if(r2 === 'broad' && maxdpi){
                    maxdpi=maxdpi+'';
                    maxdpi=(/px$/).test(maxdpi) ? maxdpi : maxdpi+'px';
                    
                    css.push(' and ');
                    css.push('(');
                    css.push('max-width');
                    css.push(':');
                    css.push(maxdpi);
                    css.push(')');
                }else if(r2 === 'narrow' && mindpi){
                    mindpi=mindpi+'';
                    mindpi=(/px$/).test(mindpi) ? mindpi : mindpi+'px';
                    
                    css.push(' and ');
                    css.push('(');
                    css.push('min-width');
                    css.push(':');
                    css.push(mindpi);
                    css.push(')');
                }
                
				css.push('{');
                
				if(r1){//portrait or landscape
					
					rm=rm.concat(css);
				}
				if(!r1){
					if(r2 === 'broad'){
						if(r3 <= m1){//min-width,min value
							
							tm=[].concat(css);
							m1=r3;
						}
					}else if(r2 === 'narrow'){
						if(r3 >= m2){//max-width,max value
							
							tm=[].concat(css);
							m2=r3;
						}
					}
				}
				
				var s=null;
				var res=to_styles(style,r2,r3,0,tm,rm);
				
				css.push('}');
				res.push(css.join(''));
			}
            
			if(rm.length){
				rm.push('}');
			}
			if(tm.length){
				
				tm.push('}');
			}
			rm=rm.concat(tm);
			res.push(rm.join(''));
            
			return res.join('');
		});
		//keyframes adapter
		str=K(str);
        
		return grunt.file.write(f.dest,str);
	});
};


exports=module.exports=function(grunt){
	grunt.registerMultiTask('adapter','To handle different adaptation of the equipment.',function(){
		var options=this.options({
            report:false
        });
		
		return adapter.call(this,grunt,this.files,options);
    });
};

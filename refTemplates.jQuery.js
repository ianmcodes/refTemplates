(function ($) {
	
	var listTags = "select ul ol";
	
	var templateEngineName = (!!window.Mustache) ? 'mustache' : 'template';
	var templateEngine = (!!window.Mustache) ? Mustache : {
		render: function(template, data) {
			var pattern = /{{(.*?)}}/;
			var match = pattern.exec(template);
			while(match) {
				var keys = match[1].split('.');
				var value = data;
				for(var i = 0; i < keys.length; i++) {  // TODO: extract this into helper function
					value = value[keys[i]];
					if(value == undefined)
						break;
				}
				value = value || '';
				template = template.replace(match[0],value);
				match = pattern.exec(template);
			}
			return template;
		}
	}
	
	function apply(data, root, namespace) {
		var selector = (!!namespace) ? '[ref*=' + namespace + ']' : '[ref]';
		var elements = (!!root) ? $(selector, root) : $(selector);
		for(var i = 0; i < elements.length; i++) {
			var element = elements[i];
			var refs = (element.getAttribute('ref') || '').split('|');
			for(var j = 0; j < refs.length; j++) {
				var ref = refs[j].replace(namespace, '').split('.');
				var value = data;
				for(var k = 0; k < ref.length; k++) {
					var key = ref[k];
					if(key != "") {
						value = value[key];
						if(value == undefined)
							break;
					}
				}
				if(value != undefined) {
					_apply(element, value);
					break;
				}
			}
		}
	}
	
	function _apply(element, value) {
		if(listTags.indexOf(element.tagName.toLowerCase()) > -1 && 
				(Object.prototype.toString.call(value) == '[object Array]')) {
			// use innerHTML as template and iterate over value
			var template = element.innerHTML;
			var html = '';
			for(var i = 0; i < value.length; i++)
				html += templateEngine.render(template, value[i]);
			element.innerHTML = html;
		} else if(Object.prototype.toString.call(value) == '[object Object]') {
			// use innerHTML as template and use value on it
			element.innerHTML = templateEngine.render(element.innerHTML, value);
		} else {
			// just put the value in the element 
			element.innerHTML = value;
		}
	}
	
	window.refTemplates = {
		apply: apply
	}
})(jQuery);

/**
 * <span ref="title">A list of {{.}}</span>
 * <select ref="fruit">
 * 	<option value="#{id}">#{name}</option>
 * </select>
 *
 * {fruit:[{id:1, name:"apple"}, {id:2, name:"orange"}], title:"Fruit"}
 *
 * <span ref="title">A list of Fruit</span>
 * <select ref="fruit">
 * 	<option value="1">apple</option>
 * 	<option value="2">orange</option>
 * </select>
 */

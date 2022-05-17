jQuery(document).ready(function ()
{
	loc = new String(location.pathname);
	$("#topmenu-block .item a").each(function()
	{
		href = $(this).attr('href');
		if (href!='/' && !loc.indexOf(href))
		{
			selector = "a[href*="+href+"]";
			$("ul.topmenu li").has(selector).prepend("<div class='topmenu-item-rounder l'></div>")
				.prepend("<div class='topmenu-item-rounder r'></div>")
				.prepend("<div class='topmenu-item-bg'></div>")
				.find(selector).css({'color':'white','text-decoration':'none'});
		}
	});
/*	$("#topmenu .highlighted").html(function(){
		return "<div class='item-lc'></div>"+
				"<div class='item-highlight'><div style='margin-top:12px;'>"+
					"<a href='/"+($(this).attr('id').replace(/ref/i,''))+
					"/' style='color:white;text-decoration:none;'>"+
					$(this).attr('name')+"</a></div></div>"+
	 			"<div class='item-rc'></div>";
	});*/
	$("a[rel*=fbox]").fancybox({cyclic:true});
	$(".submenu a[href="+location.pathname+"]").addClass('bolder');
});

function setCookie (name, value, expires, path, domain, secure)
{
    document.cookie = name + "=" + escape(value) +
      ((expires) ? "; expires=" + expires : "") +
      ((path) ? "; path=" + path : "") +
      ((domain) ? "; domain=" + domain : "") +
      ((secure) ? "; secure" : "");
}
function formatNum(param){return (param+'').replace(/(\d\d\d$)/i,'&nbsp;$1.-');}

function interpol(node1,node2,val) { delta = 150; return (node1+(node2-node1)/delta*(val%delta));}

function bindEvents()
{
	$("#win-glass").bind('change',function(){
		var gl = $(this).val();
		calc.items.glass = gl;
		$("#win-glass-pattern img").attr('src',items.glasses[gl].pic);
//		$("#win-config-desc").html(items.profiles[calc.items.profile].gldesc[calc.items.glass]);
		setLimits();
		evalPrices();
	});
	$("#win-sys").bind('change',function(){
		var psys = $(this).val();
		calc.items.profile = psys;
		fillGlassBox(psys);
		$("#win-glass").change();
		$("#win-corner img").attr('src',items.profiles[psys].pattern);
	}).change();
	$("#win-furn").bind('change',function(){ evalPrices(); });
	$(".wtype-block").hover(
		function(){ $(this).find(".wtype").css('background','silver').next().show(); },
		function(){ $(this).find(".wtype").css('background','none').next().hide(); }
	);
	$(".wsubtype div").hover(
		function(){ $(this).toggleClass('overed'); },
		function(){ $(this).toggleClass('overed'); }
	);
	$(".wsubtype div").click(function(){
		$(".wsubtype div").removeClass("clicked");
		$(this).addClass("clicked");
		calc.items.subtype = $(this).attr("id");
		$("#stats #win-type").html("<strong>"+items.subtypes[calc.items.subtype].name+"</strong>");
		var im = "/images/calc/win_types/"+items.subtypes[calc.items.subtype].pic;
		imw = items.subtypes[calc.items.subtype].w;
		imh = items.subtypes[calc.items.subtype].h;
		$("#win-example img").attr("src",im);
		setLimits();
		evalPrices();
	});
}

function fillProfileBox()
{
	var profileBox = $("#win-sys"),
		profs = items.profiles;
	$(profileBox).html("");
	for (var item in profs)
		$(profileBox).append("<option value='"+item+"'>"+profs[item].name+"</option>");
}

function fillGlassBox(profile)
{
	var glassBox = $("#win-glass"),
		gls = items.glasses,
		profGls = items.profiles[profile].glasses;
	$(glassBox).html("");
	for (var i=0;i<profGls.length;i++)
	{
		currentGlass = profGls[i];
		$(glassBox).append("<option value='"+currentGlass+"'>"+gls[currentGlass].name+"</option>");
	}
}

function fillFurnBox()
{
	var furnBox = $("#win-furn"),
		furns = items.furns;
	for (var item in furns)
		$(furnBox).append("<option value='"+item+"'>"+furns[item]+"</option>");
}

function setLimits()
{
	var pdata = calcData[calc.items.profile].wsubtypes[calc.items.subtype].prices;
		limits.hmin = /d[0-9]+/.test(calc.items.subtype)?1800:600;
	for (var obj in pdata) limits.hmax = obj;
	if (calc.sizes.height<limits.hmin) calc.sizes.height = limits.hmin;
	else if (calc.sizes.height>limits.hmax) calc.sizes.height = limits.hmax;
	ldelta = Math.floor(calc.sizes.height/150)*150;
	lowmax = pdata[ldelta][0]+150*(pdata[ldelta].length-2);
	if (ldelta == limits.hmax)
	{
		limits.wmin = pdata[ldelta][0];
		limits.wmax = lowmax;
	}
	else
	{
		udelta = ldelta+150;
		limits.wmin = pdata[udelta][0];
		upmax = pdata[udelta][0]+150*(pdata[udelta].length-2);
		limits.wmax = lowmax>upmax?upmax:lowmax;
	}
	if (calc.sizes.width<limits.wmin) calc.sizes.width = limits.wmin;
	else if (calc.sizes.width>limits.wmax) calc.sizes.width = limits.wmax;
	$("#winheight").slider("option","min",limits.hmin).slider("option","max",limits.hmax).slider("value",calc.sizes.height);
	$("#winwidth").slider("option","min",limits.wmin).slider("option","max",limits.wmax).slider("value",calc.sizes.width);
}

function evalPrices()
{
	var prof = calc.items.profile,
		pd = calcData[prof].wsubtypes[calc.items.subtype].prices,
		s = calc.sizes, w = s.width/1000, h = s.height/1000,
		height = s.height, width = s.width,
		koefs = {h:0,s:0,d:0};
	montazh = Math.round(w*h*1000);
	montazh = montazh<1500?1500:montazh;
	otkosy = 510*(w+2*h+0.6);
	podok = 450*(w+0.15);
	zadpodok = 30*(w+0.15);
	zvsh = 570;
	otdelka = Math.round(otkosy+podok+zadpodok+zvsh);
	koefs.h = items.profiles[prof].koef.h;
	koefs.s = items.profiles[prof].koef.s;
	koefs.d = items.profiles[prof].koef.d;
	if (height in pd)
	{
		if (width%150 == 0)
		{
			koef = Math.floor((width-pd[height][0])/150)+1;
			price = pd[height][koef];
		}
		else
		{
			koef = Math.ceil((width-pd[height][0])/150);
			price = interpol(pd[height][koef],pd[height][koef+1],width);
		}
	}
	else
	{
		hlvec = pd[height-height%150]; hmvec = pd[height-height%150+150];
		wkoef = Math.floor((width-limits.wmin)/150)+1;
		if (width%150 == 0)
			price = interpol(hlvec[wkoef],hmvec[wkoef],height);
		else
		{
			wp1 = interpol(hlvec[wkoef],hmvec[wkoef],height);
			wp2 = interpol(hlvec[wkoef+1],hmvec[wkoef+1],height);
			price = interpol(wp1,wp2,width);
		}
	}
	if (/\d\di/.test(calc.items.glass))
	{
		price += 100*w*h;
		koefs.h+=0.1;
	}
	if ((prof=='rehau-euro' && /d32*/.test(calc.items.glass)) ||
			(/d40*/.test(calc.items.glass)))
	{
		price*=1.1;
		koefs.h+= 0.1;
		koefs.s+=0.1;
		koefs.d+=0.1;
	}
					// Выбор коэффициента цены в зависимости от разных типов окон
	if ($("#win-furn").val() == 'prot')
	{
		switch (calc.items.subtype[0])
		{
			case 'a':
			case 'd':
				if (!(calc.items.subtype=='a1' || calc.items.subtype=='a2')) price*=1.05;
				break;
			case 'b':
				price*=1.086;
				break;
			case 'c':
				price*=1.095;
				break;
		}
		koefs.h+=0.05;
		koefs.d+=0.05;
	}
	area = $("#stats .stat").filter(':first').width()-60;
	skidka = 0.15;
	price = Math.ceil(price*(1-skidka));
	credit = Math.round(price/6);
	/*
		intv - интервал изменения значений, в миллисекундах
		msecs - количество миллисекунд, в течение которых происходит изменение
		ticks - количество "тиков" таймера (количество изменений цен)
		deltas - значения, на которые должны измениться цены
		currents - текущие значения цен
	 */
	var timer,intv = 25,msecs = 750;
					// Вычисление разниц между текущими и полученными ценами
	deltas = { m:montazh-calc.prices.montazh, o:otdelka-calc.prices.otdelka, p:price-calc.prices.total, cr:credit-calc.prices.credit };
	currents = { m:calc.prices.montazh, o:calc.prices.otdelka, p:calc.prices.total, cr:calc.prices.credit };
	ticks = msecs/intv;
					// Вычисление коэффициентов изменения цены за "тик" таймера
	deltas.km = deltas.m/ticks; deltas.ko = deltas.o/ticks; deltas.kp = deltas.p/ticks; deltas.kc = deltas.cr/ticks;
	timer = setInterval(function(){
		if (ticks<=0) clearInterval(timer);
		$("#calc #calc-prices").find("#montazh-price").html(formatNum(Math.round(currents.m)))
			.end().find("#otdelka-price").html(formatNum(Math.round(currents.o)))
			.end().find("#price-sum").html(formatNum(Math.round(currents.p)))
			.end().find("#credit-sum .sum").html(formatNum(Math.round(currents.cr)));
					// Изменение текущих значений
		currents.m += deltas.km; currents.o += deltas.ko; currents.p += deltas.kp; currents.cr += deltas.kc;
		ticks--;
	},intv);
	calc.prices.montazh = montazh;
	calc.prices.otdelka = otdelka;
	calc.prices.total = price;
	calc.prices.credit = credit;
	setCookie('price',calc.prices.total);
	$("#stats").find("#heat").width(50+area*koefs.h)
		.end().find("#silence").width(50+area*koefs.s)
		.end().find("#design").width(50+area*koefs.d);
}

function initRulers()
{
	$("#winheight").slider({
		orientation:'vertical',
		min:600,
		max:2550,
		step:10,
		animate:true,
		slide:function(event,ui){ $("#vvalue").html(ui.value); },
		change:function(event,ui){ $("#vvalue").html(ui.value); },
		stop:function(){
			calc.sizes.height = $(this).slider("option","value");
			calc.sizes.width = $("#winwidth").slider("option","value");
			setLimits();
			evalPrices();
		}
	}).slider("option","value",calc.sizes.height);
	$("#winwidth").slider({
		step:10,
		min:600,
		max:2550,
		animate:true,
		slide:function(event,ui){ $("#hvalue").html(ui.value); },
		change:function(event,ui){ $("#hvalue").html(ui.value); },
		stop:function(){
			calc.sizes.width = $(this).slider("option","value");
			setLimits();
			evalPrices();
		}
	}).slider("option","value",calc.sizes.width);
}

var calc =
{
	items:{profile:'',glass:'',subtype:'b2'},
	sizes:{width:1460,height:1420},
	prices:{montazh:0,otdelka:0,credit:0,total:0}
},
	limits = {wmin:0,wmax:0,hmin:0,hmax:0};

$(document).ready(function(){
	fillProfileBox();
	fillFurnBox();
	bindEvents();
	initRulers();
	$(".wsubtype div[id="+calc.items.subtype+"]").click();
//	$("#win-example img").attr("src","/images/calc/win_types/b34.png").width(screen.width*0.22);
});
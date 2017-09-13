Date.new = function(args){
	var params = args;
	var k = ["year", "month", "day", "hour", "minutes", "secondes", "millisecondes"]; 
	for(i=0; i<k.length; i++) {
		if( !params[k[i]] ){
			params[k[i]] = 1; 
		}
	}
	return new Date(params["year"], params["month"], params["day"], params["hour"], params["minutes"], params["secondes"], params["millisecondes"]);
}
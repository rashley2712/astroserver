drop table stats;
create table stats as 
	select 
		date(Date) as Date, 
		max(Temperature) as MaxTemperature, 
		min(Temperature) as MinTemperature,
		avg(Temperature) as MeanTemperature, 
		max(RelativeHumidity) as MaxRelativeHumidity,
		min(RelativeHumidity) as MinRelativeHumidity,
		max(Pressure) as MaxPressure, 
		min(Pressure) as MinPressure,
		max(IRSky) as MaxSkyTemperature, 
		min(IRSky) as MinSkyTemperature,
		avg(IRSky) as MeanSkyTemperature,
		max(IRAmbient) as MaxCabinet, 
		min(IRAmbient) as MinCabinet,
		avg(IRAmbient) as MeanCabinet,
		max(CPUtemperature) as MaxCPUTemperature, 
		min(CPUtemperature) as MinCPUTemperature,
		avg(CPUtemperature) as MeanCPUTemperature 
			
		from meteolog 
		group by date(Date) 
		order by Date;
select * from stats;
.schema

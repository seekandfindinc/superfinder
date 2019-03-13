import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
	name: 'search',
	pure: false
})
export class SearchPipe implements PipeTransform {
	transform(items: any[], search: any): any[] {
		var searchVals = Object.keys(search).filter((k, v) => {
			if(search[k].length > 0){
				return true;
			}
		});
		if(searchVals.length > 0){
			return items.filter(item => {
				return item.property_address.toLowerCase().includes(search.property_address.toLowerCase())
					&& item.corporation.toLowerCase().includes(search.corporation.toLowerCase())
					&& (item.lender ? item.lender.toLowerCase().includes(search.lender.toLowerCase()) : false)
					&& (search.closed ? search.closed == item.closed : true);
			});
		}
		return items;
	}
}
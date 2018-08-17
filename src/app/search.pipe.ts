import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'search'
})
export class SearchPipe implements PipeTransform {
	transform(items: any[], searchText: string): any[] {
		if(!items) return [];
		if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter(item => {
			return item.seller_last_name.toLowerCase().indexOf(searchText) > -1 || item.ordernumber.toString().indexOf(searchText) > -1;
		});
	}
}
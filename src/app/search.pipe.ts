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
			// return item.seller_last_name.toLowerCase().indexOf(searchText) > -1 || item.reference_number.toString().indexOf(searchText) > -1;
			return item.reference_number.toString().indexOf(searchText) > -1;
		});
	}
}
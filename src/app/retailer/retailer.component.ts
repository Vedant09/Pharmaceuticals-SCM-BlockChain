import { Component, OnInit, ViewChild } from '@angular/core';
import { ContractService } from '../services/contract.service'
import { HttpClient } from '@angular/common/http'
declare var Materialize;
@Component({
  selector: 'app-retailer',
  templateUrl: './retailer.component.html',
  styleUrls: ['./retailer.component.css']
})
export class RetailerComponent implements OnInit {
name = 'Retailer';
dataValue = [];

  @ViewChild('product') product: any;
  @ViewChild('orderNo') orderNo: any;
  @ViewChild('deliveryDate') deliveryDate: any;
  @ViewChild('temp') temp: any;
  @ViewChild('price') price: any;
  @ViewChild('quantity') quantity: any;

  productList = [
    { name: 'Dolo', cost: 50 },
    { name: 'Crocin', cost: 35 },
    { name: 'Mondeslor', cost: 80 },
    { name: 'Allegra', cost: 30 },
    { name: 'Citrizen', cost: 20 }
  ];
  selectedProduct = { name: null, cost: 0 };
  selectedQuantity = 0;
  minDate;
  transactions;

  constructor(private contract: ContractService, private http: HttpClient) {
   }

  ngOnInit() {
    this.getTransactions();
    this.getToday();

    this.orderNo.nativeElement.value = "EBC"+(this.contract.getCurrentBlockNumber()+1);

    this.contract.checkReportTrigger.map(result => {
      if (result.length >= 1) {
      this.setData(result);
      }
    });
  }
  setData(result) {
      if (result[1] == '1') {
        this.http.get('http://127.0.0.1:8080/ipfs/' + result[2], { responseType: 'text'}).subscribe(response => {
          this.dataValue.push({orderno: result[0], fileInfo: response + result[2]});
        });
      }
    }

  onSubmit(event) {
    this.contract.createOrder(this.orderNo.nativeElement.value,
      this.product.nativeElement.value,
      this.deliveryDate.nativeElement.value.toString(),
      this.price.nativeElement.value,
      this.quantity.nativeElement.value).then(result => {
      console.log(result);
      Materialize.toast('Request Created. Tx id: ' + result.tx, 4000);
      this.product.nativeElement.value = null;
      this.orderNo.nativeElement.value = "EBC"+(this.contract.getCurrentBlockNumber()+1);;
      this.deliveryDate.nativeElement.value = null;
      this.quantity.nativeElement.value = null;
      this.price.nativeElement.value = null;
      this.getToday()
      this.deliveryDate.nativeElement.value = this.minDate;
      this.getTransactions();
    });
  }

  getToday() {
    let dtToday = new Date();
    let month: any = dtToday.getMonth() + 1;
    let day: any = dtToday.getDate();
    let year: any = dtToday.getFullYear();
    if(month < 10)
        month = '0' + month.toString();
    if(day < 10)
        day = '0' + day.toString();
     this.minDate = year + '-' + month + '-' + day;
  }

  setSelectedProduct(product) {
    this.selectedProduct = this.productList.filter(e => e.name === product)[0];
    this.price.nativeElement.value = this.selectedProduct.cost*this.selectedQuantity;
  }

  setSelectedQuantity(quantity) {
    this.selectedQuantity = quantity;
    this.price.nativeElement.value = this.selectedProduct.cost*this.selectedQuantity;
  }

  getTransactions() {
    this.transactions = [];
    let blockNumber = this.contract.getCurrentBlockNumber();
    for(let i=1; i<=blockNumber; i++) {
      this.transactions.push(
        this.contract.getTransaction(i),
      );
    }
  }
}

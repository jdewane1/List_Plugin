(function ($) {

    $.fn.createList = function (selector,options) {
        //selector is the div container that contains all the classes of items .list_item
        //all items you want to show/hide for paging must have a class of .list_item
        //first page number but have id of Page
        //last page number label/span to show must have id EndPage
        //prev and next buttons/images must have id Prev and Next

        var settings = $.extend({
            itemsPerPage: 5,
            dSort: "",
            dSortDir : ""
        }, options);

        //global variables
        var parent = selector;
        var listItems = $('.list_item');
        var listItemsArray = [];
        var pageNumber = 1;
        var itemCount = 1;
        var lastPage = 0;
        var length = 0;

        // class of object of ListItems
        function ListItem(Index, Page, Item, Visible) {
            var _index = Index;
            var _page = Page;
            var _item = Item;
            var _visible = Visible;
          

            Object.defineProperty(this, "Index", {
                get: function () {
                    return _index;
                },
                set: function (value) {
                    _index = value;
                }
            })

            Object.defineProperty(this, "Page", {
                get: function () {
                    return _page;
                },
                set: function (value) {
                    _page = value;
                }
            })

            Object.defineProperty(this, "Item", {
                get: function () {
                    return _item;
                },
                set: function (value) {
                    _item = value;
                }
            })

            Object.defineProperty(this, "Visible", {
                get: function () {
                    return _visible;
                },
                set: function (value) {
                    _visible = value;
                }
            })

        };

        //puts list items into javascript array of objects on page load
        $.each(listItems, function (index, element) {
            //var test = index % itemsPerPage;

            if (itemCount > settings.itemsPerPage) {
                pageNumber = pageNumber + 1;
                itemCount = 1;
            }

            var listItem = new ListItem(index, pageNumber, element, "Y");
            listItemsArray.push(listItem);
            itemCount = itemCount + 1;
                       
        });//end each

        //get the length of array
        length = listItemsArray.length;

        //calculate last page.
        function CalculateLastPage(length) {
            if (length % settings.itemsPerPage == 0) {
                lastPage = length / settings.itemsPerPage;
            }
            else {
                lastPage = length / settings.itemsPerPage;
                lastPage = Math.ceil(lastPage);
            }
        };// end function

        //loop through list items to show or hide based on pageNumber.
        function DisplayItems(pageNumber) {
            var anyShow = 0;
            for (var i = 0; i < listItemsArray.length; i++) {
                if (listItemsArray[i].Page == pageNumber && listItemsArray[i].Visible == "Y") {
                    $(listItemsArray[i].Item).show();
                    anyShow = anyShow + 1;
                }
                else
                    $(listItemsArray[i].Item).hide();
            }  

            if (anyShow > 0)
                $('#emptyList').hide();
            else
                $('#emptyList').show();
            
        };//end function

        //this is called on sort or filter to update array with proper page number and if visible or not when filtering.
        function UpdateArray(pageNumber,searchValue) {
            var newPageNumber = 1;
            var count = 1;

            $.each(listItemsArray, function (index, element) {
                var ind = element.Index;
                var p = element.Page;
                var e = element.Item;
                var searchValue = $('#txtSearch').val().trim().toLowerCase();
                var values = $("span.filter", e).text().toLowerCase();               
                var isFound = values.indexOf(searchValue) > -1;

                //filtering
                if (searchValue != "") {

                    if (isFound) {
                        if (count > settings.itemsPerPage) {
                            newPageNumber = newPageNumber + 1;
                            count = 1;
                        }
                        element.Page = newPageNumber;
                        element.Visible = "Y";
                        count = count + 1;
                    }
                    else {
                        element.Page = 0;
                        element.Visible = "N";
                    }
                    $(parent).append(element.Item);
                }//sorting only below
                else {
                    if (count > settings.itemsPerPage) {
                        newPageNumber = newPageNumber + 1;
                        count = 1;
                    }
                    element.Page = newPageNumber;
                    element.Visible = "Y";
                    count = count + 1;
                    $(parent).append(element.Item);
                }                
            });//end each

            var btns = $('#buttonsGroup');
            $(parent).append(btns);
            $('#Page').text(1);
            lastPage = newPageNumber;
            SetLastPage(lastPage);           

        };//end function

        //********************************PAGING***************************************************************

        //button clicks. whether to show or hide prev / next buttons.  lp stands for last page number
        function PagingButtons(btnText, lp) {
            var currentPage = $('#Page').text();
            var newPage = 1;

            if (btnText == "Next")
                newPage = parseInt(currentPage) + parseInt(1);
            else
                newPage = parseInt(currentPage) - parseInt(1);

            //Next button was clicked
            if (btnText == "Next") {
                if (currentPage >= 1 && currentPage < lp - 1) {
                    $('#Page').text(newPage);
                    $('#Prev,#Next,#FirstPage,#LastPage').show();
                }
                else if (currentPage == lp - 1) {
                    $('#Page').text(newPage);
                    $('#Prev,#FirstPage').show();
                    $('#Next,#LastPage').hide();
                }
                DisplayItems(newPage);
            }//Prev button was clicked
            else if (btnText == "Prev") {
                if (currentPage == 2) {
                    $('#Page').text(newPage);
                    $('#Prev,#FirstPage').hide();
                    $('#Next,#LastPage').show();
                }
                else {
                    $('#Page').text(newPage);
                    $('#Prev,#Next,#FirstPage,#LastPage').show();
                }
                DisplayItems(newPage);
            }//FirstPage button was clicked
            else if (btnText == "FirstPage") {
                $('#Page').text(1);
                $('#Prev,#FirstPage').hide();
                $('#Next,#LastPage').show();
                DisplayItems(1);
            }//Lastpage button was clicked.
            else if (btnText == "LastPage") {
                $('#Page').text(lp);
                $('#Prev,#FirstPage').show();
                $('#Next,#LastPage').hide();
                DisplayItems(lp);
            }
            else {

            }

        };//end function.

        $('#Prev, #Next,#FirstPage,#LastPage').click(function () {
            var btnText = $(this).attr('id');
            PagingButtons(btnText,lastPage);
        });


        //*************************SORTING***********************************************

        $('#SortBy, #SortOrder').change(function () {

            var sortBy = $('#SortBy').val();
            var sortOrder = $('#SortOrder').val();
            var currentPage = $('#Page').text();

            var sortIntClass = $('.list_item:eq(0)').find('.' + sortBy).hasClass('sortInt');
            var sortDateClass = $('.list_item:eq(0)').find('.' + sortBy).hasClass('sortDate');

            if (sortIntClass == true || sortDateClass == true) {
                SortArray(sortBy, sortOrder);
                DisplayItems(1);
            }
            else {
                SortArray(sortBy, sortOrder);
                DisplayItems(1);
            }
        });

       

        function SortArray(classCol, order) {
                var isInt = $('.' + classCol).hasClass('sortInt');
                var isDate = $('.' + classCol).hasClass('sortDate');

                listItemsArray.sort(function (a, b) {
                var vA = $('.' + classCol, a.Item).text().trim();
                var vB = $('.' + classCol, b.Item).text().trim();

                    if (order == "asc") {
                        if ((vA === "") && (vB === "")) return 0; //they're both null and equal
                        else if ((vA === "") && (vB != "")) return -1; //move a downwards
                        else if ((vA != "") && (vB === "")) return 1; //move b downwards
                        else {

                            if (isInt) {
                                vAA = parseInt(vA);
                                vBB = parseInt(vB);
                                return vAA - vBB;
                            }
                            else if (isDate) {
                                var vAA = new Date(vA);
                                var vBB = new Date(vB);
                                return vAA - vBB;
                            }
                            else {
                                return (vA < vB) ? -1 : (vA > vB) ? 1 : 0;
                            }
                        }
                    }
                    else {
                        if ((vA === "") && (vB === "")) return 0; //they're both null and equal
                        else if ((vA === "") && (vB != "")) return 1; //move a downwards
                        else if ((vA != "") && (vB === "")) return -1; //move b downwards
                        else {

                            if (isInt) {
                                var vAA = parseInt(vA);
                                var vBB = parseInt(vB);
                                return vBB - vAA;
                                //return (vBB < vAA) ? -1 : (vBB > vAA) ? 1 : 0;
                            }
                            else if (isDate) {
                                var vAA = new Date(vA);
                                var vBB = new Date(vB);
                                return vBB - vAA;
                            }
                            else {
                                return (vB < vA) ? -1 : (vB > vA) ? 1 : 0;
                            }
                        }
                    }

            });
            UpdateArray();
        };//end function

        ////*********************FILTER*************************************************

        //
        $('#btnSearch').click(function () {
            var searchValue = $('#txtSearch').val().toLowerCase();
            UpdateArray(1,searchValue);
            DisplayItems(1);         
        });

        $('#btnClear').click(function () {
            $('#txtSearch').val('');
            UpdateArray(1,"");
            DisplayItems(1);
        });

        //This is for paging because if page 1 of 1 we want to hide all paging buttons.
        //otherwise if page 1 of 5 or what not, then show next and last page.
        function SetLastPage(lPage) {
            $('#EndPage').text(lPage);

            //meaning page 1 of 1
            if (lPage == 1) {
                $('#Prev,#Next,#FirstPage,#LastPage').hide();
            }
            //meaning 1 of 2 or 1 of 5 or 1 of 10
            else {
                $('#Prev,#FirstPage').hide();
                $('#Next,#LastPage').show();
            }

        };

        //*******************************************PAGE LOAD********************************************
        CalculateLastPage(length);
        if(settings.dSort != "" && settings.dSortDir !="")
            SortArray(settings.dSort, settings.dSortDir);
        DisplayItems(1);
        $('#Prev,#FirstPage').css({ "display": "none" });
        $('#EndPage').text(lastPage);

    };//end $.fn.createList


}(jQuery));//end function
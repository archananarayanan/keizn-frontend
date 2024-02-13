import React, { useEffect, useMemo, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts'
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { UsersIcon } from '@heroicons/react/24/solid';
import { FaCircle } from "react-icons/fa";
import { ArrowLongUpIcon } from '@heroicons/react/24/outline';


type DashboardData = {
  sku: string,
  name: string,
  category: string,
  instock: number,
  available_stock: number,
  tags: any
}

type CreateOptions = {
  name: string
}

type CreateStock = {
  sku: string,
  name: string,
  price: number,
  category: string,
  allocated: number,
  alloc_build: number,
  alloc_sales: number,
  available: number,
  incoming: number,
  build_order: number,
  net_stock: number,
  instock: number,
  tags: any
}

export default function Dashboard() {

  const [stocks, setStocks] = useState<DashboardData[] | []>([]);
  const [masterStocks, setMasterStocks] = useState<DashboardData[] | []>([]);
  const [search, setSearch] = useDebounceValue("", 300);
  const [canBuild, setCanBuild] = useState(false);
  const [category, setCategory] = useState([])
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [createCategory, setCreateCategory] = useState<string>('');
  const [createTag, setCreateTag] = useState<string>('');
  const [stockModal, setStockModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [tagModal, setTagModal] = useState(false);
  const [stockSortOrder, setStockSortOrder] = useState(true);
  const [formData, setFormData] = useState<CreateStock>({ sku: '', name: '', price: 0, category: '', allocated: 0, alloc_build: 0, alloc_sales: 0, available: 0, incoming: 0, build_order: 0, net_stock: 0, instock: 0, tags: [] });
  const numberFields = [  "allocated", "alloc_build", "alloc_sales", "available", "incoming", "build_order", "net_stock", "instock", "price"]

  const auth = useMemo(() => {
    let key = ''
    const token = localStorage.getItem('token')
    if (token) {
      key = `Bearer ${token}`;
    }
    return key
  }, [localStorage.getItem('token')])

  function changeField(e: any) {
    let name = e.target.name || e.target.key;
    console.log("form name-", name);
    let value = e.target.value;
    let formObject: CreateStock = { ...formData };
    console.log(name)
    if( numberFields.includes(name)){
      setFormData({ ...formObject, [name]: parseInt(value) });
    }
    else {
    setFormData({ ...formObject, [name]: value });
    }
  }

  function sortStock<T>(prop: (c: DashboardData) => T): void {
    stocks.sort((a, b) => {
        if (prop(a) < prop(b))
            return -1;
        if (prop(a) > prop(b))
            return 1;
        return 0;
    });

    if (stockSortOrder == false) {
        stocks.reverse();
        setStockSortOrder(true);
    } else {
        setStockSortOrder(false);
    }        
}

const handleSearchChange = (e: { target: { value: string; }; }) => {
  setSearch(e.target.value);
};

  async function create_Category(category: CreateOptions, auth: string) {
    let url = "https://web-production-3b2a.up.railway.app/api/create_category/";
    const data = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${auth}`
      },
      body: JSON.stringify(category)
    })
      .then(data => { return data.json() });
    return data;
  }

  const handleCategorySubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log("create new caregory--------------------")
    var payload: CreateOptions = { name: createCategory || '' }
    const response = await create_Category(payload, auth);
    console.log(response)
    if (response) {
      toast.success("Success Creating Category");
    } else {
      toast.error(response.error);
    }
  }

  
  async function create_Tag(tag: CreateOptions, auth: string) {
    let url = "https://web-production-3b2a.up.railway.app/api/create_tags/";
    const data = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${auth}`
      },
      body: JSON.stringify(tag)
    })
      .then(data => { return data.json() });
    return data;
  }

  const handleTagSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log("create new tag--------------------")
    var payload: CreateOptions = { name: createTag || '' }
    const response = await create_Tag(payload, auth);
    console.log(response)
    if (response) {
      toast.success("Success Creating New Tag");
    } else {
      toast.error(response.error);
    }
  }

  async function create_Stock(stock: CreateStock, auth: string) {
    let url = "https://web-production-3b2a.up.railway.app/api/create_stock/";
    const data = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${auth}`
      },
      body: JSON.stringify(stock)
    })
      .then(data => { return data.json() });
    return data;
  }

  const handleStockSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    var payload: CreateStock = formData;
    payload['category'] = createCategory;
    payload['tags'] = [createTag];
    console.log("---creating stocks-------");
    console.log(payload);
    const response = await create_Stock(payload, auth);
    console.log(response)
    if (response) {
      toast.success("Success Creating Stock");
    } else {
      toast.error(response.error);
    }
    return;
  }

  useEffect(() => {
    if(search == ""){
      setStocks(masterStocks);
    }
    let res: DashboardData[] = []
    masterStocks.forEach(s => {
      if(s.sku.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase())) {
        res.push(s);
      }});
    
      setStocks(res);
  }, [search])

  useEffect(() => {
    const getCategories = async (auth: string) => {
      let url = "https://web-production-3b2a.up.railway.app/api/get_categories/";
      const data = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${auth}`
        },
      })
        .then(data => {
          console.log(data);
          let res = data.json();
          console.log("stocks data-", res)
          return res;
        });
      setCategories(data);
    }

    getCategories(auth)
  }, [createCategory])

  useEffect(() => {
    const getTags = async (auth: string) => {
      let url = "https://web-production-3b2a.up.railway.app/api/get_tags/";
      const data = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${auth}`
        },
      })
        .then(data => {
          console.log(data);
          let res = data.json();
          console.log("tags data-", res)
          return res;
        });
      setTags(data);
    }

    getTags(auth)
  }, [createTag])

  useEffect(() => {
    const getStocks = async (canBuild: boolean, category: Array<string>, auth: string) => {
      let url = "https://web-production-3b2a.up.railway.app/api/get_stock_dashboard/";
      if (canBuild) {
        url = url + "?can_build=true"
      }
      if (category.length > 0) {
        url = url + "?category="
        category.forEach((c: string) => {
          url = url + `${c},`
        });
      }
      const data = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${auth}`
        },
      })
        .then(data => {
          console.log(data);
          let res = data.json();
          return res;
        });
      setStocks(data);
      setMasterStocks(data);
    }
    getStocks(canBuild, category, auth)
  }, [canBuild, category])

  return (
    <div className="flex w-full min-h-full px-1 align-center lg:px-2">
      <div className="flex pt-4 px-10 ml-3 w-full min-h-[700px]">
        <div>
          {/* Ststes & header */}
        </div>
        <div className="relative flex flex-col w-full h-full text-gray-700 bg-white shadow-md rounded-xl bg-clip-border">
          <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white rounded-none bg-clip-border">
            <div className="flex items-center justify-between gap-8 mb-8">
              <div className="flex flex-col gap-2 shrink-0 sm:flex-row">

              </div>
            </div>
            <div className="flex flex-row items-center justify-between gap-4 md:flex-row">
              <div className="relative h-10 max-w-[400px] min-w-[200px]">
                <div className="absolute grid w-5 h-5 top-2/4 right-3 -translate-y-2/4 place-items-center text-blue-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" aria-hidden="true" className="w-5 h-5">
                    <path strokeLinecap="round" stroke-linejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path>
                  </svg>
                </div>
                <input
                  className="peer h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 !pr-9 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                  placeholder=" " onChange={handleSearchChange} />
                <label
                  className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-gray-900 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                  Search
                </label>
              </div>
              <button onClick={() => {setStockModal(true)}}
                className="flex select-none items-center gap-3 rounded-lg bg-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                  stroke-width="2" className="w-4 h-4">
                  <path
                    d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z">
                  </path>
                </svg>
                New item
              </button>
              <button onClick={() => {setCategoryModal(true)}}
                className="flex select-none items-center gap-3 rounded-lg bg-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                  stroke-width="2" className="w-4 h-4">
                  <path
                    d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z">
                  </path>
                </svg>
                New Category
              </button>
              <button onClick={() => {setTagModal(true)}}
                className="flex select-none items-center gap-3 rounded-lg bg-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                  stroke-width="2" className="w-4 h-4">
                  <path
                    d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z">
                  </path>
                </svg>
                New Tag
              </button>
              {/* select component htmlFor filter */}
            </div>
          </div>
          <div className="p-6 px-2 overflow-auto">
            <table className="w-full mt-4 text-left table-auto min-w-max">
              <thead>
                <tr>
                  <th
                    className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                    <p
                      className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      SKU
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" onClick={() => sortStock(p=> p.sku)}
                        stroke="currentColor" aria-hidden="true" className="w-4 h-4">
                        <path strokeLinecap="round" stroke-linejoin="round"
                          d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                      </svg>
                    </p>
                  </th>
                  <th
                    className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                    <p
                      className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Name
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" onClick={() => sortStock(p=> p.name)}
                        stroke="currentColor" aria-hidden="true" className="w-4 h-4">
                        <path strokeLinecap="round" stroke-linejoin="round"
                          d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                      </svg>
                    </p>
                  </th>
                  <th
                    className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                    <p
                      className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Tags
                    </p>
                  </th>
                  <th
                    className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                    <p
                      className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Category
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" onClick={() => sortStock(p=> p.category)}
                        stroke="currentColor" aria-hidden="true" className="w-4 h-4">
                        <path strokeLinecap="round" stroke-linejoin="round"
                          d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                      </svg>
                    </p>
                  </th>
                  <th
                    className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                    <p
                      className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      In stock
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" onClick={() => sortStock(p=> p.instock)}
                        stroke="currentColor" aria-hidden="true" className="w-4 h-4">
                        <path strokeLinecap="round" stroke-linejoin="round"
                          d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                      </svg>
                    </p>
                  </th>
                  <th
                    className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                    <p
                      className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Available stock
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" onClick={() => sortStock(p=> p.available_stock)}
                        stroke="currentColor" aria-hidden="true" className="w-4 h-4">
                        <path strokeLinecap="round" stroke-linejoin="round"
                          d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                      </svg>
                    </p>
                  </th>
                  <th
                    className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                    <p
                      className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    </p>
                  </th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((s: DashboardData) => (
                  <tr>
                    <td className="p-4 border-b border-blue-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                            {s.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <div className="flex flex-col">
                        <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                          {s.name}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <div className="flex flex-col">
                        <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                          {s.tags}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <div className="flex flex-col">
                        <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                          {s.category}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <div className="flex flex-row">
                        {s.instock > 1000 && <svg width="20" height="20" className='gap-1'>
                                              <circle cx="10" cy="10" r="2" stroke="green" stroke-width="4" fill="green"  />
                                            </svg>}
                        {s.instock < 1000 && <svg width="20" height="20" className='gap-1'>
                                              <circle cx="10" cy="10" r="2" stroke="red" stroke-width="4" fill="red"  />
                                            </svg>}
                        <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                          {s.instock}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <div className="flex flex-row">
                        {s.available_stock > 1000 && <svg width="20" height="20" className='gap-1'>
                                              <circle cx="10" cy="10" r="2" stroke="green" stroke-width="4" fill="green"  />
                                            </svg>}
                        {s.available_stock < 1000 && <svg width="20" height="20" className='gap-1'>
                                              <circle cx="10" cy="10" r="2" stroke="red" stroke-width="4" fill="red"  />
                                            </svg>}
                        <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                          {s.available_stock}
                        </p>
                      </div>
                    </td>
                    {/* <td className="p-4 border-b border-blue-gray-50">
                    <button
                      className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                      type="button">
                      <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                          className="w-4 h-4">
                          <path
                            d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z">
                          </path>
                        </svg>
                      </span>
                    </button>
                  </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      { stockModal && <div id="stock-modal" className="flex overflow-y-auto overflow-x-hidden fixed align-center z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div className="relative p-4 w-full max-w-2xl max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add new stock
              </h3>
              <button type="button" onClick={()=>{setStockModal(false);}} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="default-modal">
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="p-4 md:p-5">
                <form className="space-y-4"  onSubmit={handleStockSubmit}>
                <div className="grid gap-4 mb-4 grid-cols-4">
                    <div className="col-span-2">
                        <label htmlFor="sku" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">SKU</label>
                        <input type="text" name="sku" id="sku" onChange={changeField} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Type product name" required={true} />
                    </div>
                    <div className="col-span-2">
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                        <input type="text" name="name" id="name" onChange={changeField} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Type product name" required={true} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Price</label>
                        <input type="number" name="price" id="price" onChange={changeField} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="$2999" required={true} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                        <select id='category' onClick={(e) => {setCreateCategory((e.target as HTMLOptionElement).value)}} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                            {categories.map(({ name }) => (
                                <option  key="category" value={name} className="flex items-center gap-2">
                                  {name}
                                </option>
                              ))}
                        </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="tags" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tag</label>
                        <select id='tags' onClick={(e) => {setCreateTag((e.target as HTMLOptionElement).value)}} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                            {tags.map(({ name }) => (
                                <option  key="tags" value={name} className="flex items-center gap-2">
                                  {name}
                                </option>
                              ))}
                        </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="allocated" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Allocated</label>
                        <input type="number" name="allocated" id="allocated" onChange={changeField} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="0" required={true} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="alloc_build" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Allocated Build</label>
                        <input type="number" name="alloc_build" id="alloc_build" onChange={changeField} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="0" required={true} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="alloc_sales" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Allocated Sales</label>
                        <input type="number" name="alloc_sales" id="alloc_sales" onChange={changeField} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="0" required={true} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="incoming" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Incoming</label>
                        <input type="number" name="incoming" id="incoming" onChange={changeField} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="0" required={true} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="build_order" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Build Order</label>
                        <input type="number" name="build_order" id="build_order" onChange={changeField} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="0" required={true} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="net_stock" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Net Stock</label>
                        <input type="number" name="net_stock" id="net_stock" onChange={changeField} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="0" required={true} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="instock" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Instock</label>
                        <input type="number" name="instock" id="instock" onChange={changeField} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="0" required={true} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="available" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Available</label>
                        <input type="number" name="available" id="available" onChange={changeField} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="0" required={true} />
                    </div>
                </div>
                <button type="submit" className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
                    Add new stock
                </button>
                </form>
            </div>
          </div>
        </div>
      </div>}
      { categoryModal && <div id="category-modal" className="flex overflow-y-auto overflow-x-hidden fixed align-center z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div className="relative p-4 w-full max-w-2xl max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add new Category
              </h3>
              <button type="button" onClick={()=>{setCategoryModal(false);}} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="default-modal">
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="p-4 md:p-5">
                <form className="space-y-4" onSubmit={handleCategorySubmit} >
                <div className="grid align-center gap-4 mb-4 grid-cols-1">
                    <div className="col-span-2">
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                        <input type="text" name="name" id="name" onChange={(e) => {setCreateCategory(e.target.value || '')}} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Type category name" required={true} />
                    </div>
                </div>
                <button type="submit" className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
                    Add new category
                </button>
                </form>
            </div>
          </div>
        </div>
      </div>}
      { tagModal && <div id="tag-modal" className="flex overflow-y-auto overflow-x-hidden fixed align-center z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div className="relative p-4 w-full max-w-2xl max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add new Tag
              </h3>
              <button type="button" onClick={()=>{setTagModal(false);}} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="default-modal">
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="p-4 md:p-5">
                <form className="space-y-4" onSubmit={handleTagSubmit} >
                <div className="grid align-center gap-4 mb-4 grid-cols-1">
                    <div className="col-span-2">
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tag</label>
                        <input type="text" name="name" id="name" onChange={(e) => {setCreateTag(e.target.value || '')}} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Type tag name" required={true} />
                    </div>
                </div>
                <button type="submit" className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
                    Add new tag
                </button>
                </form>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}

function useDebounce(search: string, arg1: number) {
  throw new Error('Function not implemented.');
}

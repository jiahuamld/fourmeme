'use client';
import { useState, useEffect, useCallback } from 'react';
import { Button, Table, InputNumber, Input } from 'antd';
import dayjs from 'dayjs';
import { get } from '@/app/clientApi/axiosInstance';

interface TransactionSummaryProps {
  playerID: string;
}

interface CategorySummary {
  type: string;
  totalAmount: number;
  transactionCount: number;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  info: string;
  createdAt: string;
}

interface TransactionData extends Array<Transaction> {}

// Format amount, truncate to two decimal places
const formatAmount = (amount: number) => {
  return Number((Math.floor(Math.abs(amount) * 100) / 100) * Math.sign(amount));
};

// Calculate category summary
const calculateCategorySummary = (transactions: Transaction[], isIncome: boolean): CategorySummary[] => {
  const categoryMap = new Map<string, CategorySummary>();

  transactions.forEach(transaction => {
    if (transaction.type === 'tax') return; // Exclude tax type
    const isTransactionIncome = transaction.amount > 0;
    if (isIncome !== isTransactionIncome) return; // Only process transactions of the corresponding type

    const { type, amount } = transaction;
    const absAmount = Math.abs(amount);
    
    if (!categoryMap.has(type)) {
      categoryMap.set(type, {
        type,
        totalAmount: absAmount,
        transactionCount: 1
      });
    } else {
      const current = categoryMap.get(type)!;
      categoryMap.set(type, {
        ...current,
        totalAmount: current.totalAmount + absAmount,
        transactionCount: current.transactionCount + 1
      });
    }
  });

  return Array.from(categoryMap.values());
};

export function TransactionSummary({ playerID }: TransactionSummaryProps) {
  const [data, setData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '1w' | '1m'>('24h');
  const [selectedTypes, setSelectedTypes] = useState<Array<{category: string, type: 'income' | 'expense'}>>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [fromFilter, setFromFilter] = useState<string>('');
  const [toFilter, setToFilter] = useState<string>('');

  const processTransactions = useCallback((currentData: TransactionData) => {
    if (!currentData) return;

    let transactions = [...currentData];

    // Filter by time range
    const now = dayjs();
    const filtered = transactions.filter(transaction => {
      const transactionTime = dayjs(transaction.createdAt);
      const diffHours = now.diff(transactionTime, 'hour');
      const diffDays = now.diff(transactionTime, 'day');
      const diffMonths = now.diff(transactionTime, 'month');

      switch (timeRange) {
        case '24h':
          return diffHours <= 24;
        case '1w':
          return diffDays <= 7;
        case '1m':
          return diffMonths <= 1;
        default:
          return true;
      }
    });

    // Filter by type
    const typeFiltered = filtered.filter(transaction => {
      if (selectedTypes.length === 0) return true;
      
      return selectedTypes.some(selected => {
        const isIncome = transaction.amount > 0 && transaction.type !== 'tax';
        const isExpense = transaction.amount < 0 && transaction.type !== 'tax';
        
        if (selected.category === 'all') {
          return (selected.type === 'income' && isIncome) || 
                 (selected.type === 'expense' && isExpense);
        }
        return ((selected.type === 'income' && isIncome) || 
                (selected.type === 'expense' && isExpense)) && 
               selected.category === transaction.type;
      });
    });

    // Filter by amount range
    const amountFiltered = typeFiltered.filter(transaction => {
      const absAmount = Math.abs(transaction.amount);
      if (minAmount !== null && absAmount < minAmount) return false;
      if (maxAmount !== null && absAmount > maxAmount) return false;
      return true;
    });

    // Filter by from/to
    const fromToFiltered = amountFiltered.filter(transaction => {
      const info = transaction.info.toLowerCase();
      const fromMatch = !fromFilter || info.includes(`from player ${fromFilter.toLowerCase()}`);
      const toMatch = !toFilter || (info.includes(`to player ${toFilter.toLowerCase()}`) || info.includes(`rent of building ${toFilter.toLowerCase()}`));
      return fromMatch && toMatch;
    });

    setFilteredTransactions(fromToFiltered);
  }, [timeRange, selectedTypes, minAmount, maxAmount, fromFilter, toFilter]);

  // Check if type is selected
  const isTypeSelected = (category: string, type: 'income' | 'expense') => {
    return selectedTypes.some(item => 
      item.category === category && item.type === type
    );
  };

  // Check if all income is selected
  const isAllIncomeSelected = () => {
    return selectedTypes.some(item => 
      item.category === 'all' && item.type === 'income'
    );
  };

  // Check if all expense is selected
  const isAllExpenseSelected = () => {
    return selectedTypes.some(item => 
      item.category === 'all' && item.type === 'expense'
    );
  };

  // Handle type selection
  const handleTypeSelect = (category: string, type: 'income' | 'expense') => {
    setSelectedTypes(prev => {
      // If selecting all income or all expense
      if (category === 'all') {
        // Check if the corresponding "all" is already selected
        const hasAll = prev.some(item => 
          item.category === 'all' && item.type === type
        );

        if (hasAll) {
          // If already selected, remove
          return prev.filter(item => !(item.category === 'all' && item.type === type));
        } else {
          // If not selected, add (and remove other selections of the same type)
          const otherTypes = prev.filter(item => item.type !== type);
          return [...otherTypes, { category: 'all', type }];
        }
      }

      // If selecting specific type, first remove the corresponding "all" selection
      const withoutAll = prev.filter(item => 
        !(item.category === 'all' && item.type === type)
      );

      const existingIndex = withoutAll.findIndex(item => 
        item.category === category && item.type === type
      );
      
      if (existingIndex >= 0) {
        // If already selected, remove
        const newTypes = [...withoutAll];
        newTypes.splice(existingIndex, 1);
        return newTypes;
      } else {
        // If not selected, add
        return [...withoutAll, { category, type }];
      }
    });
  };

  // Get data useEffect
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await get<TransactionData>(`/api/v1/transactions?playerID=${playerID}`);
        setData(response);
        processTransactions(response);
      } catch (error) {
        console.error('Failed to fetch transaction data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [playerID, processTransactions]);

  // Listen for filter condition changes
  useEffect(() => {
    if (data) {
      processTransactions(data);
    }
  }, [data, processTransactions]);

  // Calculate total income, expense, and tax
  const calculateTotals = (transactions: Transaction[]) => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'tax') {
          acc.tax += transaction.amount;
        } else if (transaction.amount > 0) {
          acc.income += transaction.amount;
        } else {
          acc.expense += Math.abs(transaction.amount);
        }
        return acc;
      },
      { income: 0, expense: 0, tax: 0 }
    );
  };

  const totals = data ? calculateTotals(data) : { income: 0, expense: 0, tax: 0 };
  const incomeCategorySummary = data ? calculateCategorySummary(data, true) : [];
  const expenseCategorySummary = data ? calculateCategorySummary(data, false) : [];

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Filter and list container */}
      <div className="flex flex-col gap-6">
        {/* Filter area */}
        <div className="w-full">
          <div className="space-y-4">
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-green-500/20 to-green-700/20 p-4 rounded-xl border border-green-500/30">
                <div className="text-green-400 text-sm mb-1">Income</div>
                <div className="text-xl font-bold text-green-300">{formatAmount(totals.income)}</div>
              </div>
              <div className="bg-gradient-to-br from-pink-500/20 to-pink-700/20 p-4 rounded-xl border border-pink-500/30">
                <div className="text-pink-400 text-sm mb-1">Expense</div>
                <div className="text-xl font-bold text-pink-300">{formatAmount(totals.expense)}</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-700/20 p-4 rounded-xl border border-yellow-500/30">
                <div className="text-yellow-400 text-sm mb-1">Tax</div>
                <div className="text-xl font-bold text-yellow-300">{formatAmount(totals.tax)}</div>
              </div>
            </div>

            {/* Type display panel */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                <h3 className="text-green-400 text-sm mb-3">Income Categories</h3>
                <div className="space-y-2">
                  {incomeCategorySummary.map(cat => (
                    <div key={cat.type} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">{cat.type}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">{cat.transactionCount} transactions</span>
                        <span className="text-green-300">{formatAmount(cat.totalAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                <h3 className="text-pink-400 text-sm mb-3">Expense Categories</h3>
                <div className="space-y-2">
                  {expenseCategorySummary.map(cat => (
                    <div key={cat.type} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">{cat.type}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">{cat.transactionCount} transactions</span>
                        <span className="text-pink-300">{formatAmount(cat.totalAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Time range filter */}
            <div>
              <div className="text-gray-300 text-sm mb-2">Time Range</div>
              <div className="flex items-center gap-2">
                <Button
                  type={timeRange === '24h' ? 'primary' : 'default'}
                  onClick={() => setTimeRange('24h')}
                  className={`${
                    timeRange === '24h'
                      ? '!bg-sky-500 hover:!bg-sky-500 !text-white !border-0'
                      : '!bg-black/50 !text-white !border !border-white/10 hover:!bg-black/50'
                  } !transition-colors`}
                >
                  24 Hours
                </Button>
                {/* <Button
                  type={timeRange === '1w' ? 'primary' : 'default'}
                  onClick={() => setTimeRange('1w')}
                  className={`${
                    timeRange === '1w'
                      ? '!bg-sky-500 hover:!bg-sky-500 !text-white !border-0'
                      : '!bg-black/50 !text-white !border !border-white/10 hover:!bg-black/50'
                  } !transition-colors`}
                >
                  1 Week
                </Button>
                <Button
                  type={timeRange === '1m' ? 'primary' : 'default'}
                  onClick={() => setTimeRange('1m')}
                  className={`${
                    timeRange === '1m'
                      ? '!bg-sky-500 hover:!bg-sky-500 !text-white !border-0'
                      : '!bg-black/50 !text-white !border !border-white/10 hover:!bg-black/50'
                  } !transition-colors`}
                >
                  1 Month
                </Button> */}
              </div>
            </div>

            {/* Amount range filter */}
            <div>
              <div className="text-gray-300 text-sm mb-2">Amount Range</div>
              <div className="flex items-center gap-2">
                <InputNumber
                  placeholder="Min Amount"
                  value={minAmount}
                  onChange={value => setMinAmount(value)}
                  className="w-[120px] [&.ant-input-number]:!bg-black/50 [&.ant-input-number]:!border-white/10 [&.ant-input-number]:!text-gray-300 [&_.ant-input-number-input]:!bg-transparent [&_.ant-input-number-input]:!text-gray-300 [&_.ant-input-number-handler-wrap]:!bg-black/50 [&_.ant-input-number-handler]:!border-white/10 [&_.ant-input-number-handler]:!text-gray-300 [&_.ant-input-number-handler:hover]:!text-gray-300 [&.ant-input-number:hover]:!border-white/30 [&.ant-input-number-focused]:!border-white/30 [&_.ant-input-number-handler:active]:!text-gray-300"
                  precision={2}
                />
                <span className="text-gray-300">to</span>
                <InputNumber
                  placeholder="Max Amount"
                  value={maxAmount}
                  onChange={value => setMaxAmount(value)}
                  className="w-[120px] [&.ant-input-number]:!bg-black/50 [&.ant-input-number]:!border-white/10 [&.ant-input-number]:!text-gray-300 [&_.ant-input-number-input]:!bg-transparent [&_.ant-input-number-input]:!text-gray-300 [&_.ant-input-number-handler-wrap]:!bg-black/50 [&_.ant-input-number-handler]:!border-white/10 [&_.ant-input-number-handler]:!text-gray-300 [&_.ant-input-number-handler:hover]:!text-gray-300 [&.ant-input-number:hover]:!border-white/30 [&.ant-input-number-focused]:!border-white/30 [&_.ant-input-number-handler:active]:!text-gray-300"
                  precision={2}
                />
                <Button
                  onClick={() => {
                    setMinAmount(null);
                    setMaxAmount(null);
                  }}
                  className="[&.ant-btn]:!bg-black/50 [&.ant-btn]:!text-gray-300 [&.ant-btn]:!border-white/10 hover:[&.ant-btn]:!bg-black/50 [&.ant-btn:hover]:!border-white/30 [&.ant-btn:hover]:!text-gray-300"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* From/To filter */}
            <div>
              <div className="text-gray-300 text-sm mb-2">Transaction Target</div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="From Player ID"
                  value={fromFilter}
                  onChange={e => setFromFilter(e.target.value)}
                  className="w-[220px] [&.ant-input]:!bg-black/50 [&.ant-input]:!border-white/10 [&.ant-input]:!text-gray-300 [&.ant-input:hover]:!border-white/30 [&.ant-input-focused]:!border-white/30"
                  allowClear
                />
                <Input
                  placeholder="To Player ID"
                  value={toFilter}
                  onChange={e => setToFilter(e.target.value)}
                  className="w-[220px] [&.ant-input]:!bg-black/50 [&.ant-input]:!border-white/10 [&.ant-input]:!text-gray-300 [&.ant-input:hover]:!border-white/30 [&.ant-input-focused]:!border-white/30"
                  allowClear
                />
              </div>
            </div>

            {/* Type filter */}
            <div>
              <div className="text-gray-300 text-sm mb-2">Transaction</div>
              <div className="space-y-4">
                {/* All button */}
                <div>
                  <Button
                    type={selectedTypes.length === 0 ? 'primary' : 'default'}
                    onClick={() => setSelectedTypes([])}
                    className={`${
                      selectedTypes.length === 0
                        ? '!bg-purple-500 hover:!bg-purple-500 !text-white !border-0' 
                        : '!bg-black/50 !text-white !border !border-white/10 hover:!bg-black/50'
                    } !transition-colors`}
                  >
                    All
                  </Button>
                </div>

                {/* Income type button */}
                <div className="space-y-2">
                  <div className="text-green-400 text-sm">Income</div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type={isAllIncomeSelected() ? 'primary' : 'default'}
                      onClick={() => handleTypeSelect('all', 'income')}
                      className={`${
                        isAllIncomeSelected()
                          ? '!bg-green-500 hover:!bg-green-500 !text-white !border-0' 
                          : '!bg-black/50 !text-white !border !border-white/10 hover:!bg-black/50'
                      } !transition-colors`}
                    >
                      All Income
                    </Button>
                    {incomeCategorySummary.map(cat => (
                      <Button
                        key={`income-${cat.type}`}
                        type={isTypeSelected(cat.type, 'income') ? 'primary' : 'default'}
                        onClick={() => handleTypeSelect(cat.type, 'income')}
                        className={`${
                          isTypeSelected(cat.type, 'income')
                            ? '!bg-green-500 hover:!bg-green-500 !text-white !border-0' 
                            : '!bg-black/50 !text-white !border !border-white/10 hover:!bg-black/50'
                        } !transition-colors`}
                      >
                        {cat.type} ({cat.transactionCount})
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Expense type button */}
                <div className="space-y-2">
                  <div className="text-pink-400 text-sm">Expense</div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type={isAllExpenseSelected() ? 'primary' : 'default'}
                      onClick={() => handleTypeSelect('all', 'expense')}
                      className={`${
                        isAllExpenseSelected()
                          ? '!bg-pink-500 hover:!bg-pink-500 !text-white !border-0' 
                          : '!bg-black/50 !text-white !border !border-white/10 hover:!bg-black/50'
                      } !transition-colors`}
                    >
                      All Expense
                    </Button>
                    {expenseCategorySummary.map(cat => (
                      <Button
                        key={`expense-${cat.type}`}
                        type={isTypeSelected(cat.type, 'expense') ? 'primary' : 'default'}
                        onClick={() => handleTypeSelect(cat.type, 'expense')}
                        className={`${
                          isTypeSelected(cat.type, 'expense')
                            ? '!bg-pink-500 hover:!bg-pink-500 !text-white !border-0' 
                            : '!bg-black/50 !text-white !border !border-white/10 hover:!bg-black/50'
                        } !transition-colors`}
                      >
                        {cat.type} ({cat.transactionCount})
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* List area */}
        <div className="w-full min-h-0 overflow-auto">
          <Table
            dataSource={filteredTransactions}
            columns={[
              {
                title: 'Time',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
                sorter: (a: Transaction, b: Transaction) => 
                  dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
              },
              {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
              },
              {
                title: 'Amount',
                dataIndex: 'amount',
                key: 'amount',
                render: (amount: number, record: Transaction) => {
                  const formattedAmount = formatAmount(amount);
                  const isIncome = record.type !== 'tax' && amount > 0;
                  const isExpense = record.type !== 'tax' && amount < 0;
                  const isTax = record.type === 'tax';
                  
                  let className = '';
                  if (isIncome) className = 'text-green-300';
                  else if (isExpense) className = 'text-pink-300';
                  else if (isTax) className = 'text-yellow-300';
                  
                  return <span className={className}>{formattedAmount}</span>;
                },
                sorter: (a: Transaction, b: Transaction) => a.amount - b.amount,
              },
              {
                title: 'Description',
                dataIndex: 'info',
                key: 'info',
              },
            ]}
            loading={loading}
            rowKey="id"
            className="
              [&_.ant-table]:!bg-transparent 
              [&_.ant-table-thead>tr>th]:!bg-black/50 
              [&_.ant-table-thead>tr>th]:!text-gray-300 
              [&_.ant-table-thead>tr>th]:!font-normal 
              [&_.ant-table-thead>tr>th]:!border-white/10
              [&_.ant-table-tbody>tr>td]:!bg-transparent 
              [&_.ant-table-tbody>tr>td]:!border-white/10
              [&_.ant-table-tbody>tr>td]:!text-gray-300
              [&_.ant-table-tbody>tr>td]:!py-2
              [&_.ant-table-tbody>tr>td]:!text-sm
              [&_.ant-table-thead>tr>th]:!py-2
              [&_.ant-table-thead>tr>th]:!text-sm
              [&_.ant-table-tbody>tr:hover>td]:!bg-white/5
              [&_.ant-table-cell-row-hover]:!bg-white/5
              [&_.ant-table-placeholder]:!bg-transparent
              [&_.ant-table-placeholder_.ant-table-cell]:!border-white/10
              [&_.ant-table-placeholder>div]:!text-gray-500
              [&_.ant-table-pagination]:!mt-4
              [&_.ant-table-pagination]:!bg-transparent
              [&_.ant-pagination-item]:!bg-black/50
              [&_.ant-pagination-item]:!border-white/10
              [&_.ant-pagination-item-active]:!bg-sky-500
              [&_.ant-pagination-item-active]:!border-0
              [&_.ant-pagination-item>a]:!text-gray-300
              [&_.ant-pagination-item-active>a]:!text-white
              [&_.ant-pagination-prev>button]:!bg-black/50
              [&_.ant-pagination-next>button]:!bg-black/50
              [&_.ant-pagination-prev>button]:!border-white/10
              [&_.ant-pagination-next>button]:!border-white/10
              [&_.ant-pagination-prev_.ant-pagination-item-link]:!text-gray-300
              [&_.ant-pagination-next_.ant-pagination-item-link]:!text-gray-300
              [&_.ant-table-column-sorter]:!text-gray-500
              [&_.ant-table-column-sorter-up.active]:!text-sky-500
              [&_.ant-table-column-sorter-down.active]:!text-sky-500
              [&_.ant-empty-description]:!text-gray-500
              [&_.ant-empty-img-simple-path]:!fill-gray-700
              [&_.ant-empty-img-simple-ellipse]:!fill-gray-800
            "
            pagination={{
              showSizeChanger: false,
              showQuickJumper: false,
              size: 'small',
              className: '!text-gray-300'
            }}
            locale={{
              emptyText: 'No Data'
            }}
          />
        </div>
      </div>
    </div>
  );
} 
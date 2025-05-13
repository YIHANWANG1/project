import pandas as pd
import json
import os
import numpy as np

# Define file path
excel_file = os.path.join('travel data', 'Dec 2022 forecast datastore page no links.xlsx')

# Read Excel file, specify sheet_name as 'Quarterly data'
try:
    df = pd.read_excel(excel_file, sheet_name='Quarterly data')
    print("Excel file columns:", list(df.columns))
    
    # Extract column 5 (International visitors.1) data - visitor count
    visitors_column = 'International visitors.1'
    if visitors_column in df.columns:
        visitors_data = df[visitors_column].tolist()
        print(f"Found '{visitors_column}' column")
    else:
        print(f"Could not find '{visitors_column}' column")
        exit(1)
    
    # Extract column 8 (International visitors.2) data - spending amount
    spending_column = 'International visitors.2'
    if spending_column in df.columns:
        spending_data = df[spending_column].tolist()
        print(f"Found '{spending_column}' column")
    else:
        print(f"Could not find '{spending_column}' column")
        exit(1)
    
    # Extract Period column as labels
    if 'Period' in df.columns:
        periods = df['Period'].tolist()
    else:
        periods = [f"Period {i+1}" for i in range(len(visitors_data))]
    
    # Clean data: handle NaN and non-numeric values
    cleaned_periods = []
    cleaned_visitors = []
    cleaned_spending = []
    
    for i in range(len(periods)):
        # Check if period is valid
        if pd.isna(periods[i]) or periods[i] is None:
            period_str = f"Period {i+1}"
        else:
            period_str = str(periods[i])
        
        # Check if visitor value is valid
        visitor_value = visitors_data[i]
        spend_value = spending_data[i]
        
        # Only add when both columns have valid numeric values
        if (isinstance(visitor_value, (int, float)) and not pd.isna(visitor_value) and 
            isinstance(spend_value, (int, float)) and not pd.isna(spend_value)):
            
            cleaned_periods.append(period_str)
            cleaned_visitors.append(float(visitor_value))
            cleaned_spending.append(float(spend_value))
        elif isinstance(visitor_value, str) and visitor_value.strip() != '':
            # This is a title or unit description line, print for debugging
            print(f"Skipping title row: {period_str} - {visitor_value} - {spend_value}")
    
    # Create data structure
    trend_data = {
        "periods": cleaned_periods,
        "visitors": cleaned_visitors,
        "spending": cleaned_spending
    }
    
    # Save data to JSON file
    with open('international_visitors_data.json', 'w') as f:
        # Use default parameter to handle special values
        json.dump(trend_data, f, default=lambda x: None if isinstance(x, float) and np.isnan(x) else x)
    
    print("Data saved to international_visitors_data.json")
    
    # Print preview of first few rows
    print("\nPreview of first 5 data points:")
    for i in range(min(5, len(cleaned_periods))):
        print(f"{cleaned_periods[i]}: Visitors {cleaned_visitors[i]}, Spending {cleaned_spending[i]}")
    
except Exception as e:
    print(f"Error reading Excel file: {e}") 
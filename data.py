[
  {
    "lot": [
      {
        "attributes": {
          "id": "lot_trans_123",
          "is_eudr_compliant": true,
          "price_per_kg": 30,
          "transaction_cost": 15000,
          "transaction_date": "2025-05-07 00:00:00",
          "transaction_weight": 300
        },
        "v_id": "lot_trans_123",
        "v_type": "Lot"
      }
    ],
    "po": [
      {
        "attributes": {
          "UOM": "MT",
          "id": "6101234",
          "posting_date": "1970-01-01 00:00:00",
          "quantity": 0.3,
          "vendor_code": "MS-IND",
          "vendor_description": "ms_vendor"
        },
        "v_id": "6101234",
        "v_type": "Purchase_Order"
      }
    ],
    "v_buying_agent": [
      {
        "attributes": {
          "id": "BA_AGENT_TEST",
          "name": "BA_AGENT_TEST"
        },
        "v_id": "BA_AGENT_TEST",
        "v_type": "Local_Buying_Agent"
      }
    ],
    "v_farmer": [
      {
        "attributes": {
          "certified": true,
          "id": "F-GH-123",
          "is_eudr_compliant": false,
          "name": "Amenuveve",
          "polygon": "{\"plot\":[{\"lng\":-2.8256303,\"lat\":6.4627193},{\"lng\":-2.8260605,\"lat\":6.4635396},{\"lng\":-2.8264286,\"lat\":6.4634786},{\"lng\":-2.8270368,\"lat\":6.463096},{\"lng\":-2.8270301,\"lat\":6.4629285},{\"lng\":-2.8264901,\"lat\":6.4621391},{\"lng\":-2.8264328,\"lat\":6.4621246},{\"lng\":-2.8261315,\"lat\":6.4621994},{\"lng\":-2.8258231,\"lat\":6.4624406},{\"lng\":-2.8256303,\"lat\":6.4627193}]}"
        },
        "v_id": "F-GH-123",
        "v_type": "Farmer"
      }
    ],
    "v_farmer_group": [
      {
        "attributes": {
          "certified": false,
          "id": "FG-GH-123",
          "name": "MS - LIVELIHOOD",
          "source": "Digital"
        },
        "v_id": "FG-GH-123",
        "v_type": "Farmer_Group"
      }
    ],
    "v_pmb": [
      {
        "attributes": {
          "batch_no": "batch-abc",
          "id": "1001~10000121~batch-abc",
          "is_eudr_compliant": false,
          "material": 10000121,
          "plant": 1001,
          "posting_date": "1970-01-01 00:00:00"
        },
        "v_id": "1001~10000121~batch-abc",
        "v_type": "PMB"
      }
    ]
  },
  {
    "edges": [
      {
        "attributes": {},
        "directed": false,
        "e_type": "Has",
        "from_id": "FG-GH-123",
        "from_type": "Farmer_Group",
        "to_id": "F-GH-123",
        "to_type": "Farmer"
      },
      {
        "attributes": {},
        "directed": false,
        "e_type": "Has_Buying_Agent",
        "from_id": "BA_AGENT_TEST",
        "from_type": "Local_Buying_Agent",
        "to_id": "lot_trans_123",
        "to_type": "Lot"
      },
      {
        "attributes": {},
        "directed": false,
        "e_type": "Has_Farmer_Group",
        "from_id": "BA_AGENT_TEST",
        "from_type": "Local_Buying_Agent",
        "to_id": "FG-GH-123",
        "to_type": "Farmer_Group"
      },
      {
        "attributes": {},
        "directed": false,
        "e_type": "Has_Order",
        "from_id": "1001~10000121~batch-abc",
        "from_type": "PMB",
        "to_id": "6101234",
        "to_type": "Purchase_Order"
      },
      {
        "attributes": {},
        "directed": false,
        "e_type": "Contains_Lot",
        "from_id": "6101234",
        "from_type": "Purchase_Order",
        "to_id": "lot_trans_123",
        "to_type": "Lot"
      }
    ]
  }
]
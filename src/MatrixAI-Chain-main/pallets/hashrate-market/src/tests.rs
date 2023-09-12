use super::*;
use crate::{mock::*, Error, Event};
use frame_support::{assert_noop, assert_ok};
use pallet_balances::Error as BalancesError;

#[test]
fn add_machine_works() {
	new_test_ext().execute_with(|| {
        let metadata: BoundedString<Test> = vec![0u8; 100].try_into().unwrap();
		assert_ok!(HashrateMarket::add_machine(RuntimeOrigin::signed(1), [1u8; 16], metadata.clone()));
        assert_noop!(
            HashrateMarket::add_machine(RuntimeOrigin::signed(1), [1u8; 16], metadata.clone()),
            Error::<Test>::AlreadyExists,
        );
        System::assert_last_event(RuntimeEvent::HashrateMarket(Event::MachineAdded { 
            owner: 1,
            id: [1u8; 16],
            metadata,
        }));
	});
}

#[test]
fn remove_machine_works() {
	new_test_ext().execute_with(|| {
        assert_noop!(
            HashrateMarket::remove_machine(RuntimeOrigin::signed(1), [1u8; 16]),
            Error::<Test>::Unknown,
        );
        let metadata: BoundedString<Test> = vec![0u8; 100].try_into().unwrap();
		assert_ok!(HashrateMarket::add_machine(RuntimeOrigin::signed(1), [1u8; 16], metadata));
        assert_ok!(HashrateMarket::remove_machine(RuntimeOrigin::signed(1), [1u8; 16]));
        System::assert_last_event(RuntimeEvent::HashrateMarket(Event::MachineRemoved { 
            owner: 1,
            id: [1u8; 16],
        }));
	});
}

#[test]
fn make_offer_works() {
	new_test_ext().execute_with(|| {
        let metadata: BoundedString<Test> = vec![0u8; 100].try_into().unwrap();
		assert_ok!(HashrateMarket::add_machine(RuntimeOrigin::signed(1), [1u8; 16], metadata));
        assert_ok!(HashrateMarket::make_offer(RuntimeOrigin::signed(1), [1u8; 16], 10, 100, 100));
        System::assert_last_event(RuntimeEvent::HashrateMarket(Event::OfferMade { 
            owner: 1,
            id: [1u8; 16],
            price: 10,
            max_duration: 100,
            disk: 100,
        }));
	});
}

#[test]
fn cancel_offer_works() {
	new_test_ext().execute_with(|| {
        assert_noop!(
            HashrateMarket::cancel_offer(RuntimeOrigin::signed(1), [1u8; 16]),
            Error::<Test>::Unknown,
        );
        let metadata: BoundedString<Test> = vec![0u8; 100].try_into().unwrap();
		assert_ok!(HashrateMarket::add_machine(RuntimeOrigin::signed(1), [1u8; 16], metadata.clone()));
        assert_ok!(HashrateMarket::make_offer(RuntimeOrigin::signed(1), [1u8; 16], 10, 100, 100));
        assert_ok!(HashrateMarket::cancel_offer(RuntimeOrigin::signed(1), [1u8; 16]));
        System::assert_last_event(RuntimeEvent::HashrateMarket(Event::OfferCanceled { 
            owner: 1,
            id: [1u8; 16],
        }));
	});
}

#[test]
fn place_order_works() {
	new_test_ext().execute_with(|| {
        let metadata: BoundedString<Test> = vec![0u8; 100].try_into().unwrap();
        assert_noop!(
            HashrateMarket::place_order(RuntimeOrigin::signed(2), [2u8; 16], 1, [1u8; 16], 5, metadata.clone()),
            Error::<Test>::Unknown,
        );
		assert_ok!(HashrateMarket::add_machine(RuntimeOrigin::signed(1), [1u8; 16], metadata.clone()));
        assert_ok!(HashrateMarket::make_offer(RuntimeOrigin::signed(1), [1u8; 16], 10, 100, 100));
        
        assert_noop!(
            HashrateMarket::place_order(RuntimeOrigin::signed(2), [2u8; 16], 1, [1u8; 16], 200, metadata.clone()),
            Error::<Test>::DurationTooMuch,
        );
        assert_noop!(
            HashrateMarket::place_order(RuntimeOrigin::signed(2), [2u8; 16], 1, [1u8; 16], 20, metadata.clone()),
            BalancesError::<Test>::InsufficientBalance,
        );
        assert_ok!(HashrateMarket::place_order(RuntimeOrigin::signed(2), [2u8; 16], 1, [1u8; 16], 5, metadata.clone()));
        assert_eq!(Balances::reserved_balance(&2), 50);
        System::assert_last_event(RuntimeEvent::HashrateMarket(Event::OrderPlaced { 
            order_id: [2u8; 16],
            buyer: 2,
            seller: 1,
            machine_id: [1u8; 16],
            price: 10,
            duration: 5,
            total: 50,
            metadata,
        }));
	});
}

#[test]
fn renew_order_works() {
	new_test_ext().execute_with(|| {
        let metadata: BoundedString<Test> = vec![0u8; 100].try_into().unwrap();
        assert_noop!(
            HashrateMarket::renew_order(RuntimeOrigin::signed(2), [2u8; 16], 5),
            Error::<Test>::Unknown,
        );
		assert_ok!(HashrateMarket::add_machine(RuntimeOrigin::signed(1), [1u8; 16], metadata.clone()));
        assert_ok!(HashrateMarket::make_offer(RuntimeOrigin::signed(1), [1u8; 16], 10, 100, 100));
        assert_ok!(HashrateMarket::place_order(RuntimeOrigin::signed(2), [2u8; 16], 1, [1u8; 16], 5, metadata.clone()));

        assert_noop!(
            HashrateMarket::renew_order(RuntimeOrigin::signed(2), [2u8; 16], 200),
            Error::<Test>::DurationTooMuch,
        );
        assert_ok!( HashrateMarket::renew_order(RuntimeOrigin::signed(2), [2u8; 16], 3));
        assert_eq!(Balances::reserved_balance(&2), 80);
        System::assert_last_event(RuntimeEvent::HashrateMarket(Event::OrderRenewed { 
            order_id: [2u8; 16],
            buyer: 2,
            seller: 1,
            machine_id: [1u8; 16],
            duration: 3,
        }));
	});
}

#[test]
fn order_completed_works() {
	new_test_ext().execute_with(|| {
        let metadata: BoundedString<Test> = vec![0u8; 100].try_into().unwrap();
        assert_noop!(
            HashrateMarket::order_completed(RuntimeOrigin::signed(2), [2u8; 16], metadata.clone(), 90),
            Error::<Test>::Unknown,
        );
		assert_ok!(HashrateMarket::add_machine(RuntimeOrigin::signed(1), [1u8; 16], metadata.clone()));
        assert_ok!(HashrateMarket::make_offer(RuntimeOrigin::signed(1), [1u8; 16], 10, 100, 100));
        assert_ok!(HashrateMarket::place_order(RuntimeOrigin::signed(2), [2u8; 16], 1, [1u8; 16], 5, metadata.clone()));

        assert_noop!(
            HashrateMarket::order_completed(RuntimeOrigin::signed(2), [2u8; 16], metadata.clone(), 90),
            Error::<Test>::NoPermission,
        );
        assert_ok!(HashrateMarket::order_completed(RuntimeOrigin::signed(1), [2u8; 16], metadata.clone(), 90));
        assert_eq!(Balances::free_balance(&1), 150);
        assert_eq!(Balances::reserved_balance(&2), 0);
        assert_eq!(Balances::free_balance(&2), 50);
        System::assert_last_event(RuntimeEvent::HashrateMarket(Event::OrderCompleted { 
            order_id: [2u8; 16],
            buyer: 2,
            seller: 1,
            machine_id: [1u8; 16],
        }));
	});
}

#[test]
fn order_failed_works() {
	new_test_ext().execute_with(|| {
        let metadata: BoundedString<Test> = vec![0u8; 100].try_into().unwrap();
        assert_noop!(
            HashrateMarket::order_failed(RuntimeOrigin::signed(2), [2u8; 16], metadata.clone()),
            Error::<Test>::Unknown,
        );
		assert_ok!(HashrateMarket::add_machine(RuntimeOrigin::signed(1), [1u8; 16], metadata.clone()));
        assert_ok!(HashrateMarket::make_offer(RuntimeOrigin::signed(1), [1u8; 16], 10, 100, 100));
        assert_ok!(HashrateMarket::place_order(RuntimeOrigin::signed(2), [2u8; 16], 1, [1u8; 16], 5, metadata.clone()));

        assert_noop!(
            HashrateMarket::order_failed(RuntimeOrigin::signed(2), [2u8; 16], metadata.clone()),
            Error::<Test>::NoPermission,
        );
        assert_ok!(HashrateMarket::order_failed(RuntimeOrigin::signed(1), [2u8; 16], metadata.clone()));
        assert_eq!(Balances::free_balance(&1), 100);
        assert_eq!(Balances::reserved_balance(&2), 0);
        assert_eq!(Balances::free_balance(&2), 100);
        System::assert_last_event(RuntimeEvent::HashrateMarket(Event::OrderFailed { 
            order_id: [2u8; 16],
            buyer: 2,
            seller: 1,
            machine_id: [1u8; 16],
        }));
	});
}

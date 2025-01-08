program tip_calculator
    implicit none
    
    ! Variable declarations
    real :: bill_amount, tip_percentage, tip_amount, total_amount
    character(1) :: continue_calc
    
    ! Program header
    print *, "================================"
    print *, "Tip Calculator in Fortran"
    print *, "================================"
    
    do
        ! Get bill amount
        print *, "Enter bill amount ($): "
        read *, bill_amount
        
        ! Get tip percentage
        print *, "Enter tip percentage (without % symbol): "
        read *, tip_percentage
        
        ! Calculate tip and total
        tip_amount = bill_amount * (tip_percentage / 100.0)
        total_amount = bill_amount + tip_amount
        
        ! Display results with proper formatting
        print *, "--------------------------------"
        print '(A,F7.2)', " Bill Amount:    $", bill_amount
        print '(A,F7.2,A,F3.0,A)', " Tip Amount:     $", tip_amount, " (", tip_percentage, "%)"
        print *, "--------------------------------"
        print '(A,F7.2)', " Total Amount:   $", total_amount
        print *, "--------------------------------"
        
        ! Ask if user wants to calculate another tip
        print *, "Calculate another tip? (y/n): "
        read *, continue_calc
        
        if (continue_calc /= 'y' .and. continue_calc /= 'Y') then
            exit
        end if
        
        print *, "" ! Add blank line for readability
    end do
    
    print *, "Thank you for using the Tip Calculator!"
    
end program tip_calculator